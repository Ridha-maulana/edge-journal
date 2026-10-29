/* Notifikasi (toast) dan dialog konfirmasi layar penuh */
"use strict";
function notify(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);max-width:88vw;background:#1b2b57;color:#eef2ff;border:1px solid #405a9a;border-radius:12px;padding:12px 16px;font-size:13px;z-index:99999;box-shadow:0 10px 30px #000a';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}
function askConfirm(msg, okLabel = 'Ya, hapus', danger = true) {
    return new Promise(resolve => {
        const o = document.createElement('div');
        o.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:var(--nav-h,75px);background:#10182a;z-index:99999;display:flex;align-items:center;justify-content:center;padding:max(24px,env(safe-area-inset-top,0px)) 24px 24px';
        o.setAttribute('data-confirm', '1');
        document.body.classList.add('confirm-open');
        new MutationObserver((_, ob) => { if (!document.body.contains(o)) { ob.disconnect(); if (!document.querySelector('[data-confirm]')) document.body.classList.remove('confirm-open'); } }).observe(document.body, { childList: true });
        o.addEventListener('confirm-cancel', () => { o.remove(); resolve(false); });
        const b = document.createElement('div');
        b.style.cssText = 'max-width:420px;width:100%;color:#eef2ff;font-size:15px;line-height:1.6;text-align:center';
        const p = document.createElement('p');
        p.textContent = msg;
        p.style.margin = '0 0 28px';
        const r = document.createElement('div');
        r.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px';
        const mk = (label, val, bg) => { const x = document.createElement('button'); x.textContent = label; x.style.cssText = `border:0;border-radius:12px;padding:14px 12px;font-size:14px;font-weight:600;color:#fff;width:100%;background:${bg}`; x.onclick = () => { o.remove(); resolve(val); }; return x; };
        r.append(mk('Batal', false, '#2a3550'), mk(okLabel, true, danger ? '#c4455a' : '#4564e8'));
        b.append(p, r);
        o.append(b);
        document.body.appendChild(o);
    });
}
