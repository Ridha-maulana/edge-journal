/* Sudut kartu dalam sejajar kartu luar (radius konsentris).
   radius dalam = radius luar - jarak ke tepi luar, minimal 6px.
   Berlaku untuk semua halaman dan kartu. Tidak mengubah tombol kecil, pil, atau lingkaran. */
(function () {
  'use strict';
  var MIN = 6, MAXGAP = 40, T = null, busy = false;
  function box(e) {
    var s = getComputedStyle(e);
    var r = parseFloat(s.borderTopLeftRadius) || 0;
    if (r <= 0 || r >= 200) return null;
    var bw = parseFloat(s.borderTopWidth) || 0;
    var bg = s.backgroundColor;
    var hasBg = bg && bg !== 'transparent' && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(bg);
    if (!bw && !hasBg) return null;
    return { r: r, s: s, rc: e.getBoundingClientRect() };
  }
  function run() {
    T = null; if (busy) return; busy = true;
    try {
      var root = document.getElementById('root') || document.body;
      var els = root.querySelectorAll('div,section,article,aside,label,li');
      var cache = new Map();
      var get = function (e) { if (!cache.has(e)) cache.set(e, box(e)); return cache.get(e); };
      for (var i = 0; i < els.length; i++) {
        var e = els[i];
        var a = get(e); if (!a) continue;
        if (a.rc.height < 44 || a.rc.width < 100) continue;
        if (e.classList.contains('dd-item')) continue;
        var o = e.parentElement, A = null;
        while (o && o !== root && o !== document.body) { A = get(o); if (A) break; o = o.parentElement; }
        if (!A) { if (e.dataset.cr) { e.style.removeProperty('border-radius'); delete e.dataset.cr; } continue; }
        var g = Math.min(a.rc.left - A.rc.left, A.rc.right - a.rc.right, a.rc.top - A.rc.top, A.rc.bottom - a.rc.bottom);
        var want = Math.max(MIN, Math.round(A.r - g));
        if (g < 3 || g > MAXGAP || A.r > 60) continue;
        var cur = e.dataset.cr ? parseFloat(e.dataset.cr) : a.r;
        if (Math.abs(cur - want) < 1.5 && e.dataset.cr) continue;
        if (Math.abs(a.r - want) < 1.5) continue;
        e.style.setProperty('border-radius', want + 'px', 'important');
        e.dataset.cr = String(want);
      }
    } catch (err) { /* abaikan */ }
    busy = false;
  }
  function later() { if (T) return; T = setTimeout(run, 140); }
  function start() {
    var root = document.getElementById('root') || document.body;
    new MutationObserver(later).observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', later);
    document.addEventListener('transitionend', later, true);
    later();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.EJ_concentric = later;
})();
