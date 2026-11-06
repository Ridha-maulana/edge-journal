package com.ridha.edgejournal;

import android.content.SharedPreferences;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EjThemePlugin.class);
        int bg = 0;
        boolean has = false;
        try {
            SharedPreferences p = getSharedPreferences("ejtheme", MODE_PRIVATE);
            if (p.contains("bg")) { bg = p.getInt("bg", 0); has = true; }
            /* Latar jendela (tampil setelah splash, sebelum halaman web siap) ikut warna tema aplikasi, bukan hitam. */
            if (has) {
                getWindow().setBackgroundDrawable(new ColorDrawable(bg));
                getWindow().setStatusBarColor(bg);
            }
        } catch (Throwable e) { has = false; }
        super.onCreate(savedInstanceState);
        try {
            if (has && getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().setBackgroundColor(bg);
        } catch (Throwable e) { }
    }
}
