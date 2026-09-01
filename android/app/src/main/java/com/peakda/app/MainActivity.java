package com.peakda.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeSecureStorePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
