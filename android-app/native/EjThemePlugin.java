package com.ridha.edgejournal;

import android.content.Context;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* Memilih splash bawaan Android (Android 13+) sesuai tema dan mode di dalam aplikasi, bukan mode HP.
   Berlaku pada peluncuran berikutnya. Gaya "EjSplash_<tema>_<mode>" dibuat oleh gen-splash.js saat build. */
@CapacitorPlugin(name = "EjTheme")
public class EjThemePlugin extends Plugin {
    @PluginMethod
    public void setSplash(PluginCall call) {
        JSObject r = new JSObject();
        try {
            String key = call.getString("key", "");
            if (key == null || !key.matches("[a-z0-9_]+")) { r.put("ok", false); call.resolve(r); return; }
            if (Build.VERSION.SDK_INT < 33) { r.put("ok", false); r.put("reason", "sdk"); call.resolve(r); return; }
            Context c = getContext();
            int id = c.getResources().getIdentifier("EjSplash_" + key, "style", c.getPackageName());
            if (id == 0) { r.put("ok", false); r.put("reason", "none"); call.resolve(r); return; }
            c.setSplashScreenTheme(id);
            r.put("ok", true);
            call.resolve(r);
        } catch (Throwable e) {
            r.put("ok", false);
            call.resolve(r);
        }
    }
}
