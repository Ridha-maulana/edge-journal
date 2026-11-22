package com.ridha.edgejournal;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/* Inti alarm Edge Journal (v5.9.94): menyimpan jadwal dan memasangnya ke AlarmManager.
   Alarm dipasang dengan setAlarmClock (tepat waktu, tembus mode hemat daya, tampil sebagai "alarm berikutnya" di status bar).
   Jadwal berasal dari JavaScript (daftar kejadian 3 minggu ke depan); disimpan di SharedPreferences supaya bisa dipasang ulang setelah HP restart. */
final class EjAlarmCore {
    static final String PREFS = "ejalarm";
    static final String CH_RING = "ej_alarm_ring";
    static final String CH_PRE = "ej_alarm_pre";
    static final String A_RING = "com.ridha.edgejournal.ALARM_RING";
    static final String A_PRE = "com.ridha.edgejournal.ALARM_PRE";
    static final String A_SKIP = "com.ridha.edgejournal.ALARM_SKIP";
    static final String A_STOP = "com.ridha.edgejournal.ALARM_STOP";
    static final String A_SNOOZE = "com.ridha.edgejournal.ALARM_SNOOZE";
    static final long PRE_MS = 30L * 60L * 1000L;
    static final int PRE_BASE = 1000000;
    static final int SNZ_BASE = 900000;

    private EjAlarmCore() { }

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    static AlarmManager am(Context c) { return (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); }

    static void ensureChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel ring = new NotificationChannel(CH_RING, "Alarm berbunyi", NotificationManager.IMPORTANCE_HIGH);
        ring.setDescription("Alarm yang sedang berbunyi");
        ring.setSound(null, null);
        ring.enableVibration(false);
        ring.setLockscreenVisibility(1);
        nm.createNotificationChannel(ring);
        NotificationChannel pre = new NotificationChannel(CH_PRE, "Alarm yang akan datang", NotificationManager.IMPORTANCE_LOW);
        pre.setDescription("Pengingat alarm berikutnya, dengan tombol Matikan");
        pre.setSound(null, null);
        pre.enableVibration(false);
        nm.createNotificationChannel(pre);
    }

    static boolean canExact(Context c) {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager a = am(c);
        return a != null && a.canScheduleExactAlarms();
    }

    static Intent receiverIntent(Context c, String action) {
        Intent i = new Intent(action);
        i.setComponent(new ComponentName(c, EjAlarmReceiver.class));
        return i;
    }

    static Intent openAppIntent(Context c) {
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        i.putExtra("ej_alarm_ring", true);
        return i;
    }

    static int immutable() { return Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0; }

    /* Pasang satu kejadian alarm. o: id, at, grp, time, body, sub, step, tone, vib, snz, pre */
    static void setOne(Context c, JSONObject o) {
        AlarmManager a = am(c);
        if (a == null) return;
        int id = o.optInt("id");
        long at = o.optLong("at");
        Intent ri = receiverIntent(c, A_RING);
        putInfo(ri, o);
        PendingIntent ringPi = PendingIntent.getBroadcast(c, id, ri, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
        PendingIntent showPi = PendingIntent.getActivity(c, id, openAppIntent(c), PendingIntent.FLAG_UPDATE_CURRENT | immutable());
        a.setAlarmClock(new AlarmManager.AlarmClockInfo(at, showPi), ringPi);
        long now = System.currentTimeMillis();
        if (o.optBoolean("pre") && at - now > 60000L) {
            Intent pi = receiverIntent(c, A_PRE);
            putInfo(pi, o);
            PendingIntent prePi = PendingIntent.getBroadcast(c, PRE_BASE + id, pi, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
            long when = Math.max(at - PRE_MS, now + 1500L);
            if (canExact(c)) a.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, prePi);
            else a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, prePi);
        }
    }

    static void putInfo(Intent i, JSONObject o) {
        i.putExtra("id", o.optInt("id"));
        i.putExtra("at", o.optLong("at"));
        i.putExtra("grp", o.optString("grp", ""));
        i.putExtra("time", o.optString("time", ""));
        i.putExtra("body", o.optString("body", "Alarm"));
        i.putExtra("sub", o.optString("sub", "Alarm"));
        i.putExtra("step", o.optInt("step", 0));
        i.putExtra("tone", o.optString("tone", "klasik"));
        i.putExtra("tu", o.optString("tu", ""));
        i.putExtra("vib", o.optBoolean("vib", true));
        i.putExtra("snz", o.optInt("snz", 5));
        i.putExtra("dur", o.optInt("dur", 5));
    }

    static void cancelOne(Context c, int id) {
        AlarmManager a = am(c);
        if (a == null) return;
        PendingIntent p = PendingIntent.getBroadcast(c, id, receiverIntent(c, A_RING), PendingIntent.FLAG_NO_CREATE | immutable());
        if (p != null) { a.cancel(p); p.cancel(); }
        PendingIntent q = PendingIntent.getBroadcast(c, PRE_BASE + id, receiverIntent(c, A_PRE), PendingIntent.FLAG_NO_CREATE | immutable());
        if (q != null) { a.cancel(q); q.cancel(); }
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(preNotifId(id));
    }

    static int preNotifId(int id) { return 20000 + (id % 50000); }

    /* Ganti seluruh jadwal dengan daftar baru dari JavaScript (tunda/snooze milik native tidak ikut terhapus) */
    static synchronized void scheduleAll(Context c, JSONArray items) {
        SharedPreferences sp = prefs(c);
        try {
            JSONArray old = new JSONArray(sp.getString("items", "[]"));
            for (int i = 0; i < old.length(); i++) cancelOne(c, old.getJSONObject(i).optInt("id"));
        } catch (Exception e) { }
        Set<String> skip = new HashSet<String>(sp.getStringSet("skip", new HashSet<String>()));
        Set<String> seen = new HashSet<String>();
        JSONArray keep = new JSONArray();
        long now = System.currentTimeMillis();
        for (int i = 0; items != null && i < items.length(); i++) {
            JSONObject o = items.optJSONObject(i);
            if (o == null) continue;
            String grp = o.optString("grp", "");
            if (grp.length() > 0) seen.add(grp);
            if (o.optLong("at") <= now || skip.contains(grp)) continue;
            keep.put(o);
            setOne(c, o);
        }
        skip.retainAll(seen);
        sp.edit().putString("items", keep.toString()).putStringSet("skip", skip).apply();
    }

    /* Setelah HP restart atau aplikasi diperbarui: pasang ulang semua yang masih di masa depan */
    static synchronized void restore(Context c) {
        SharedPreferences sp = prefs(c);
        long now = System.currentTimeMillis();
        try {
            JSONArray items = new JSONArray(sp.getString("items", "[]"));
            for (int i = 0; i < items.length(); i++) { JSONObject o = items.getJSONObject(i); if (o.optLong("at") > now) setOne(c, o); }
            JSONArray z = new JSONArray(sp.getString("snz", "[]")), keep = new JSONArray();
            for (int i = 0; i < z.length(); i++) { JSONObject o = z.getJSONObject(i); if (o.optLong("at") > now) { setOne(c, o); keep.put(o); } }
            sp.edit().putString("snz", keep.toString()).apply();
        } catch (Exception e) { }
    }

    /* Tombol "Matikan" pada pemberitahuan "alarm yang akan datang": lewati kejadian ini beserta susulannya */
    static synchronized void skipGroup(Context c, String grp) {
        if (grp == null || grp.length() == 0) return;
        SharedPreferences sp = prefs(c);
        try {
            Set<String> skip = new HashSet<String>(sp.getStringSet("skip", new HashSet<String>()));
            skip.add(grp);
            JSONArray items = new JSONArray(sp.getString("items", "[]")), keep = new JSONArray();
            for (int i = 0; i < items.length(); i++) {
                JSONObject o = items.getJSONObject(i);
                if (grp.equals(o.optString("grp", ""))) cancelOne(c, o.optInt("id")); else keep.put(o);
            }
            sp.edit().putString("items", keep.toString()).putStringSet("skip", skip).apply();
        } catch (Exception e) { }
    }

    /* Tunda: satu kejadian baru beberapa menit lagi, dengan isi yang sama */
    static synchronized void addSnooze(Context c, Bundle b, int min) {
        try {
            SharedPreferences sp = prefs(c);
            int n = sp.getInt("snzn", 0) + 1;
            long at = System.currentTimeMillis() + Math.max(1, min) * 60000L;
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTimeInMillis(at);
            JSONObject o = new JSONObject();
            o.put("id", SNZ_BASE + (n % 90000));
            o.put("at", at);
            o.put("grp", "");
            o.put("time", String.format(java.util.Locale.US, "%02d:%02d", cal.get(java.util.Calendar.HOUR_OF_DAY), cal.get(java.util.Calendar.MINUTE)));
            o.put("body", b.getString("body", "Alarm"));
            o.put("sub", "Tunda");
            o.put("step", b.getInt("step", 0));
            o.put("tone", b.getString("tone", "klasik"));
            o.put("tu", b.getString("tu", ""));
            o.put("vib", b.getBoolean("vib", true));
            o.put("snz", b.getInt("snz", 5));
            o.put("dur", b.getInt("dur", 5));
            o.put("pre", false);
            JSONArray z = new JSONArray(sp.getString("snz", "[]"));
            z.put(o);
            sp.edit().putString("snz", z.toString()).putInt("snzn", n).apply();
            setOne(c, o);
        } catch (Exception e) { }
    }
}
