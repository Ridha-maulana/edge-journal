package com.ridha.edgejournal;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* Menyimpan tema aplikasi untuk peluncuran berikutnya:
   - bg  : warna latar tema (dipakai MainActivity untuk jendela dan WebView, supaya tidak ada jeda hitam setelah splash)
   - key : gaya splash bawaan Android (Android 13+) bernama "EjSplash_<tema>_<mode>", dibuat oleh gen-splash.js saat build. */
@CapacitorPlugin(name = "EjTheme")
public class EjThemePlugin extends Plugin {
    @PluginMethod
    public void setSplash(PluginCall call) {
        JSObject r = new JSObject();
        try {
            Context c = getContext();
            String bg = call.getString("bg", "");
            if (bg != null && bg.matches("#[0-9a-fA-F]{6}")) {
                SharedPreferences.Editor e = c.getSharedPreferences("ejtheme", Context.MODE_PRIVATE).edit();
                e.putInt("bg", Color.parseColor(bg));
                e.apply();
                r.put("bg", true);
            }
            String key = call.getString("key", "");
            if (key == null || !key.matches("[a-z0-9_]+")) { r.put("ok", false); call.resolve(r); return; }
            if (Build.VERSION.SDK_INT < 33) { r.put("ok", false); r.put("reason", "sdk"); call.resolve(r); return; }
            int id = c.getResources().getIdentifier("EjSplash_" + key, "style", c.getPackageName());
            if (id == 0) { r.put("ok", false); r.put("reason", "none"); call.resolve(r); return; }
            Activity a = getActivity();
            if (a == null) { r.put("ok", false); r.put("reason", "activity"); call.resolve(r); return; }
            a.getSplashScreen().setSplashScreenTheme(id);
            r.put("ok", true);
            call.resolve(r);
        } catch (Throwable e) {
            r.put("ok", false);
            call.resolve(r);
        }
    }

    /* Tinggi bilah status (px CSS) untuk mode layar penuh; edge=false bila mode itu tidak aktif. */
    @PluginMethod
    public void getInsets(PluginCall call) {
        JSObject r = new JSObject();
        try {
            Context c = getContext();
            float den = c.getResources().getDisplayMetrics().density;
            int px = MainActivity.statusTopPx;
            if (px <= 0) {
                int id = c.getResources().getIdentifier("status_bar_height", "dimen", "android");
                if (id > 0) px = c.getResources().getDimensionPixelSize(id);
            }
            r.put("edge", MainActivity.edge);
            r.put("top", String.valueOf(Math.round(px / (den > 0 ? den : 1f))));
        } catch (Throwable e) {
            r.put("edge", false);
            r.put("top", "0");
        }
        call.resolve(r);
    }

    /* Laju layar yang diminta aplikasi: hz = 0 (otomatis), 60, 90, atau 120. Disimpan dan dipakai lagi saat aplikasi dibuka. */
    @PluginMethod
    public void setRefresh(final PluginCall call) {
        JSObject r = new JSObject();
        try {
            int hz = call.getInt("hz", 0);
            if (hz != 0 && hz != 60 && hz != 90 && hz != 120) hz = 0;
            getContext().getSharedPreferences("ejtheme", Context.MODE_PRIVATE).edit().putInt("hz", hz).apply();
            final Activity a = getActivity();
            final int fhz = hz;
            if (a != null) a.runOnUiThread(new Runnable() { public void run() { MainActivity.applyRefresh(a, fhz); } });
            r.put("ok", true);
        } catch (Throwable e) { r.put("ok", false); }
        call.resolve(r);
    }

    /* Laju layar tertinggi yang didukung HP (Hz). */
    @PluginMethod
    public void getRefresh(PluginCall call) {
        JSObject r = new JSObject();
        try {
            Activity a = getActivity();
            float max = 60f;
            if (a != null && Build.VERSION.SDK_INT >= 23) {
                android.view.Display d = a.getWindowManager().getDefaultDisplay();
                for (android.view.Display.Mode m : d.getSupportedModes()) if (m.getRefreshRate() > max) max = m.getRefreshRate();
            } else if (a != null) {
                max = a.getWindowManager().getDefaultDisplay().getRefreshRate();
            }
            r.put("max", Math.round(max));
            r.put("ok", true);
        } catch (Throwable e) { r.put("max", 60); r.put("ok", true); }
        call.resolve(r);
    }
}
