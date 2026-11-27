package com.ridha.edgejournal;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.content.Intent;
import android.os.Build;
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
        registerPlugin(EjAlarmPlugin.class);
        int bg = 0;
        boolean has = false;
        try {
            SharedPreferences p = getSharedPreferences("ejtheme", MODE_PRIVATE);
            if (p.contains("bg")) { bg = p.getInt("bg", 0); has = true; }
            /* Latar jendela (tampil setelah splash, sebelum halaman web siap) ikut warna tema aplikasi, bukan hitam. */
            if (has) getWindow().setBackgroundDrawable(new ColorDrawable(bg));
        } catch (Throwable e) { has = false; }
        super.onCreate(savedInstanceState);
        showOverLock(getIntent());
        try { applyRefresh(this, getSharedPreferences("ejtheme", MODE_PRIVATE).getInt("hz", 0)); } catch (Throwable e) { }
        try {
            if (has && getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().setBackgroundColor(bg);
        } catch (Throwable e) { }
        try {
            enableEdgeToEdge(has, bg);
        } catch (Throwable e) {
            edge = false;
        }
    }

    /* Minta laju layar (Hz) untuk jendela ini; 0 = biarkan sistem memilih. Memilih mode layar terdekat yang ukurannya sama. */
    public static void applyRefresh(Activity a, int hz) {
        try {
            WindowManager.LayoutParams lp = a.getWindow().getAttributes();
            if (hz <= 0) {
                lp.preferredRefreshRate = 0f;
                if (Build.VERSION.SDK_INT >= 23) lp.preferredDisplayModeId = 0;
            } else {
                lp.preferredRefreshRate = (float) hz;
                if (Build.VERSION.SDK_INT >= 23) {
                    android.view.Display d = a.getWindowManager().getDefaultDisplay();
                    android.view.Display.Mode cur = d.getMode();
                    int best = 0; float diff = 1000f;
                    for (android.view.Display.Mode m : d.getSupportedModes()) {
                        if (m.getPhysicalWidth() != cur.getPhysicalWidth() || m.getPhysicalHeight() != cur.getPhysicalHeight()) continue;
                        float df = Math.abs(m.getRefreshRate() - hz);
                        if (df < diff) { diff = df; best = m.getModeId(); }
                    }
                    if (best != 0) lp.preferredDisplayModeId = best;
                }
            }
            a.getWindow().setAttributes(lp);
        } catch (Throwable e) { }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        showOverLock(intent);
    }

    /* Dibuka oleh alarm yang berbunyi: tampil di atas layar kunci dan menyalakan layar */
    private void showOverLock(Intent it) {
        try {
            if (it == null || !it.getBooleanExtra("ej_alarm_ring", false)) return;
            if (Build.VERSION.SDK_INT >= 27) {
                setShowWhenLocked(true);
                setTurnScreenOn(true);
            } else {
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
            }
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } catch (Throwable e) { }
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
