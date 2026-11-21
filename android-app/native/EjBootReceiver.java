package com.ridha.edgejournal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/* Memasang ulang alarm setelah HP menyala kembali atau aplikasi diperbarui */
public class EjBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        try { EjAlarmCore.restore(c); } catch (Throwable e) { }
    }
}
