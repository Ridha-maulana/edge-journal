package com.ridha.edgejournal;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* Jembatan JavaScript untuk alarm native (v5.9.94).
   schedule({items})  : ganti seluruh jadwal alarm
   status()           : { notif, exact, full } izin yang berlaku
   requestNotif()     : minta izin notifikasi (Android 13+)
   openSettings({kind}): buka pengaturan 'notif' | 'exact' | 'full'
   getRinging()       : alarm yang sedang berbunyi (bila ada)
   stop() / snooze({min}) : matikan atau tunda alarm yang sedang berbunyi
   Peristiwa: alarmRing (alarm mulai berbunyi), alarmStop (berhenti) */
@CapacitorPlugin(name = "EjAlarm")
public class EjAlarmPlugin extends Plugin {
    private static volatile EjAlarmPlugin inst;

    @Override
    public void load() { inst = this; }

    static JSObject toJs(Bundle b) {
        JSObject o = new JSObject();
        if (b == null) return o;
        o.put("id", b.getInt("id"));
        o.put("at", b.getLong("at"));
        o.put("grp", b.getString("grp", ""));
        o.put("time", b.getString("time", ""));
        o.put("body", b.getString("body", ""));
        o.put("sub", b.getString("sub", ""));
        o.put("step", b.getInt("step", 0));
        o.put("tone", b.getString("tone", "klasik"));
        o.put("vib", b.getBoolean("vib", true));
        o.put("snz", b.getInt("snz", 5));
        return o;
    }

    /* Dipanggil dari EjAlarmService (utas utama) */
    static void emit(final String ev, final Bundle b) {
        final EjAlarmPlugin p = inst;
        if (p == null) return;
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override public void run() { try { p.notifyListeners(ev, toJs(b)); } catch (Throwable e) { } }
        });
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            JSArray items = call.getArray("items");
            EjAlarmCore.ensureChannels(getContext());
            EjAlarmCore.scheduleAll(getContext(), items);
            JSObject r = new JSObject();
            r.put("ok", true);
            call.resolve(r);
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        try {
            Context c = getContext();
            r.put("notif", NotificationManagerCompat.from(c).areNotificationsEnabled());
            r.put("exact", EjAlarmCore.canExact(c));
            boolean full = true;
            if (Build.VERSION.SDK_INT >= 34) {
                NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
                full = nm == null || nm.canUseFullScreenIntent();
            }
            r.put("full", full);
            r.put("sdk", Build.VERSION.SDK_INT);
        } catch (Throwable e) { }
        call.resolve(r);
    }

    @PluginMethod
    public void requestNotif(PluginCall call) {
        try {
            Activity a = getActivity();
            if (Build.VERSION.SDK_INT >= 33 && a != null) {
                ActivityCompat.requestPermissions(a, new String[] { "android.permission.POST_NOTIFICATIONS" }, 4401);
            }
        } catch (Throwable e) { }
        call.resolve();
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Context c = getContext();
            String kind = call.getString("kind", "notif");
            Intent i;
            if ("exact".equals(kind) && Build.VERSION.SDK_INT >= 31) {
                i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + c.getPackageName()));
            } else if ("full".equals(kind) && Build.VERSION.SDK_INT >= 34) {
                i = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + c.getPackageName()));
            } else if (Build.VERSION.SDK_INT >= 26) {
                i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                i.putExtra(Settings.EXTRA_APP_PACKAGE, c.getPackageName());
            } else {
                i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + c.getPackageName()));
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
        } catch (Throwable e) { }
        call.resolve();
    }

    @PluginMethod
    public void getRinging(PluginCall call) {
        JSObject r = new JSObject();
        Bundle b = EjAlarmService.current;
        if (b != null) {
            r = toJs(b);
            r.put("ringing", true);
        } else {
            r.put("ringing", false);
        }
        call.resolve(r);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), EjAlarmService.class);
            i.setAction(EjAlarmCore.A_STOP);
            getContext().startService(i);
        } catch (Throwable e) { }
        call.resolve();
    }

    @PluginMethod
    public void snooze(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), EjAlarmService.class);
            i.setAction(EjAlarmCore.A_SNOOZE);
            Integer min = call.getInt("min", 5);
            i.putExtra("min", min == null ? 5 : min.intValue());
            getContext().startService(i);
        } catch (Throwable e) { }
        call.resolve();
    }
}
