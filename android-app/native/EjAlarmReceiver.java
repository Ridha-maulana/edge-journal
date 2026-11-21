package com.ridha.edgejournal;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

/* Penerima alarm dari AlarmManager:
   - ALARM_RING : saatnya berbunyi, menyalakan EjAlarmService
   - ALARM_PRE  : menampilkan "Alarm yang akan datang: HH:mm" dengan tombol Matikan (melewati kejadian itu)
   - ALARM_SKIP : tombol Matikan pada pemberitahuan di atas */
public class EjAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String act = i == null ? null : i.getAction();
        if (act == null) return;
        try {
            if (EjAlarmCore.A_RING.equals(act)) {
                Intent s = new Intent(c, EjAlarmService.class);
                s.putExtras(i.getExtras());
                ContextCompat.startForegroundService(c, s);
            } else if (EjAlarmCore.A_PRE.equals(act)) {
                showUpcoming(c, i);
            } else if (EjAlarmCore.A_SKIP.equals(act)) {
                EjAlarmCore.skipGroup(c, i.getStringExtra("grp"));
                NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) nm.cancel(EjAlarmCore.preNotifId(i.getIntExtra("id", 0)));
            }
        } catch (Throwable e) { }
    }

    private void showUpcoming(Context c, Intent i) {
        EjAlarmCore.ensureChannels(c);
        int id = i.getIntExtra("id", 0);
        Intent skip = EjAlarmCore.receiverIntent(c, EjAlarmCore.A_SKIP);
        skip.putExtra("grp", i.getStringExtra("grp"));
        skip.putExtra("id", id);
        PendingIntent skipPi = PendingIntent.getBroadcast(c, EjAlarmCore.PRE_BASE * 2 + id, skip, PendingIntent.FLAG_UPDATE_CURRENT | EjAlarmCore.immutable());
        PendingIntent open = PendingIntent.getActivity(c, 6, EjAlarmCore.openAppIntent(c), PendingIntent.FLAG_UPDATE_CURRENT | EjAlarmCore.immutable());
        NotificationCompat.Builder nb = new NotificationCompat.Builder(c, EjAlarmCore.CH_PRE);
        nb.setSmallIcon(android.R.drawable.ic_lock_idle_alarm);
        nb.setContentTitle("Alarm yang akan datang: " + i.getStringExtra("time"));
        nb.setContentText(i.getStringExtra("body"));
        nb.setPriority(NotificationCompat.PRIORITY_LOW);
        nb.setCategory(NotificationCompat.CATEGORY_ALARM);
        nb.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        nb.setOnlyAlertOnce(true);
        nb.setAutoCancel(false);
        nb.setContentIntent(open);
        nb.addAction(0, "Matikan", skipPi);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(EjAlarmCore.preNotifId(id), nb.build());
    }
}
