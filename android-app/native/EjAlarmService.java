package com.ridha.edgejournal;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import androidx.core.app.NotificationCompat;

/* Layanan alarm berbunyi: memutar nada berulang (aliran suara ALARM), bergetar, dan menampilkan pemberitahuan
   dengan tombol Tunda dan Matikan. Di layar kunci, pemberitahuan membuka layar alarm (full-screen intent). */
public class EjAlarmService extends Service {
    static final int NOTIF_ID = 4242;
    static final long MAX_RING_MS = 5L * 60L * 1000L;
    /* info alarm yang sedang berbunyi (null bila tidak ada); dibaca oleh plugin */
    static volatile Bundle current = null;

    private MediaPlayer player;
    private Vibrator vibrator;
    private PowerManager.WakeLock wake;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable autoStop = new Runnable() { @Override public void run() { stopRing(); } };

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String act = intent == null ? null : intent.getAction();
        if (EjAlarmCore.A_STOP.equals(act)) { stopRing(); return START_NOT_STICKY; }
        if (EjAlarmCore.A_SNOOZE.equals(act)) {
            Bundle b = current;
            int min = intent.getIntExtra("min", b != null ? b.getInt("snz", 5) : 5);
            if (b != null) EjAlarmCore.addSnooze(this, b, min);
            stopRing();
            return START_NOT_STICKY;
        }
        if (intent == null || intent.getExtras() == null) { stopSelf(); return START_NOT_STICKY; }
        try {
            startRing(new Bundle(intent.getExtras()));
        } catch (Throwable e) {
            stopRing();
        }
        return START_NOT_STICKY;
    }

    private void startRing(Bundle b) {
        EjAlarmCore.ensureChannels(this);
        stopAudio();
        current = b;
        Notification n = buildNotification(b);
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NOTIF_ID, n);
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(EjAlarmCore.preNotifId(b.getInt("id")));
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                if (wake == null) wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ej:alarm");
                if (!wake.isHeld()) wake.acquire(MAX_RING_MS + 15000L);
            }
        } catch (Throwable e) { }
        playTone(b.getString("tone", "klasik"), b.getString("tu", ""));
        if (b.getBoolean("vib", true)) vibrate();
        handler.removeCallbacks(autoStop);
        handler.postDelayed(autoStop, MAX_RING_MS);
        EjAlarmPlugin.emit("alarmRing", b);
    }

    private Notification buildNotification(Bundle b) {
        PendingIntent open = PendingIntent.getActivity(this, 7, EjAlarmCore.openAppIntent(this), PendingIntent.FLAG_UPDATE_CURRENT | EjAlarmCore.immutable());
        Intent si = new Intent(this, EjAlarmService.class);
        si.setAction(EjAlarmCore.A_SNOOZE);
        si.putExtra("min", b.getInt("snz", 5));
        PendingIntent snooze = PendingIntent.getService(this, 8, si, PendingIntent.FLAG_UPDATE_CURRENT | EjAlarmCore.immutable());
        Intent xi = new Intent(this, EjAlarmService.class);
        xi.setAction(EjAlarmCore.A_STOP);
        PendingIntent stop = PendingIntent.getService(this, 9, xi, PendingIntent.FLAG_UPDATE_CURRENT | EjAlarmCore.immutable());
        NotificationCompat.Builder nb = new NotificationCompat.Builder(this, EjAlarmCore.CH_RING);
        nb.setSmallIcon(android.R.drawable.ic_lock_idle_alarm);
        nb.setContentTitle(b.getString("time", ""));
        nb.setContentText(b.getString("body", "Alarm"));
        nb.setSubText(b.getString("sub", "Alarm"));
        nb.setPriority(NotificationCompat.PRIORITY_MAX);
        nb.setCategory(NotificationCompat.CATEGORY_ALARM);
        nb.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        nb.setOngoing(true);
        nb.setAutoCancel(false);
        nb.setContentIntent(open);
        nb.setFullScreenIntent(open, true);
        nb.addAction(0, "Tunda " + b.getInt("snz", 5) + " menit", snooze);
        nb.addAction(0, "Matikan", stop);
        return nb.build();
    }

    private Uri toneUri(String tone, String tu) {
        try {
            if ("hp".equals(tone) && tu != null && tu.length() > 0) return Uri.parse(tu);
            if (tone != null && !"sistem".equals(tone) && tone.matches("[a-z0-9_]+")) {
                int rid = getResources().getIdentifier("ej_t_" + tone, "raw", getPackageName());
                if (rid != 0) return Uri.parse("android.resource://" + getPackageName() + "/" + rid);
            }
        } catch (Throwable e) { }
        Uri u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (u == null) u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        return u;
    }

    private void playTone(String tone, String tu) {
        try {
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            player.setDataSource(this, toneUri(tone, tu));
            player.setLooping(true);
            player.prepare();
            player.start();
        } catch (Throwable e) {
            try {
                if (player != null) player.release();
                player = new MediaPlayer();
                player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
                player.setDataSource(this, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM));
                player.setLooping(true);
                player.prepare();
                player.start();
            } catch (Throwable e2) { player = null; }
        }
    }

    private void vibrate() {
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                vibrator = vm != null ? vm.getDefaultVibrator() : null;
            } else {
                vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            }
            if (vibrator == null) return;
            long[] pat = new long[] { 0, 600, 300, 600, 1200 };
            if (Build.VERSION.SDK_INT >= 26) {
                vibrator.vibrate(VibrationEffect.createWaveform(pat, 0), new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
            } else {
                vibrator.vibrate(pat, 0);
            }
        } catch (Throwable e) { }
    }

    private void stopAudio() {
        try { if (player != null) { player.stop(); } } catch (Throwable e) { }
        try { if (player != null) { player.release(); } } catch (Throwable e) { }
        player = null;
        try { if (vibrator != null) vibrator.cancel(); } catch (Throwable e) { }
    }

    private void stopRing() {
        handler.removeCallbacks(autoStop);
        stopAudio();
        try { if (wake != null && wake.isHeld()) wake.release(); } catch (Throwable e) { }
        current = null;
        try { stopForeground(true); } catch (Throwable e) { }
        EjAlarmPlugin.emit("alarmStop", null);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(autoStop);
        stopAudio();
        try { if (wake != null && wake.isHeld()) wake.release(); } catch (Throwable e) { }
        super.onDestroy();
    }
}
