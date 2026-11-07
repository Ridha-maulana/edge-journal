package com.ridha.edgejournal;

import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    /* true bila mode layar penuh berhasil dipasang; tinggi bilah status (px) diisi oleh pendengar inset */
    public static volatile boolean edge = false;
    public static volatile int statusTopPx = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EjThemePlugin.class);
        int bg = 0;
        boolean has = false;
        try {
            SharedPreferences p = getSharedPreferences("ejtheme", MODE_PRIVATE);
            if (p.contains("bg")) { bg = p.getInt("bg", 0); has = true; }
            /* Latar jendela (tampil setelah splash, sebelum halaman web siap) ikut warna tema aplikasi, bukan hitam. */
            if (has) getWindow().setBackgroundDrawable(new ColorDrawable(bg));
        } catch (Throwable e) { has = false; }
        super.onCreate(savedInstanceState);
        try {
            if (has && getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().setBackgroundColor(bg);
        } catch (Throwable e) { }
        try {
            enableEdgeToEdge(has, bg);
        } catch (Throwable e) {
            edge = false;
        }
    }

    /* Halaman web digambar sampai ke belakang bilah status (transparan), seperti launcher HP.
       Bagian bawah (tombol navigasi) dan keyboard diberi ruang lewat padding, jadi isian tidak tertutup. */
    private void enableEdgeToEdge(boolean has, int bg) {
        Window w = getWindow();
        w.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        WindowCompat.setDecorFitsSystemWindows(w, false);
        w.setStatusBarColor(Color.TRANSPARENT);
        if (has) {
            w.setNavigationBarColor(bg);
            boolean light = lum(bg) > 0.5;
            WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, w.getDecorView());
            if (c != null) {
                c.setAppearanceLightStatusBars(light);
                c.setAppearanceLightNavigationBars(light);
            }
        }
        View content = findViewById(android.R.id.content);
        if (content == null) return;
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
            try {
                Insets sb = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
                Insets nb = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
                Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
                statusTopPx = sb.top;
                v.setPadding(nb.left, 0, nb.right, Math.max(nb.bottom, ime.bottom));
            } catch (Throwable e) { }
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(content);
        edge = true;
    }

    private static double lum(int c) {
        double r = Color.red(c) / 255.0, g = Color.green(c) / 255.0, b = Color.blue(c) / 255.0;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
}
