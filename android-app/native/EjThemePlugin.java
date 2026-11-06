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
}
