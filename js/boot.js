/* Memasang aplikasi ke halaman */
"use strict";
(function mountApp() {
    const now = () => (window.performance && performance.now) ? performance.now() : 0;
    function tick() {
        // hitung dari saat animasi splash benar-benar mulai tampil (animationstart), bukan dari awal pemuatan
        const t0 = (window.__splashAnimStart != null) ? window.__splashAnimStart : (window.__splashStart || 0);
        const left = t0 + (window.__splashMin || 0) - now();
        if (left > 16) setTimeout(tick, Math.min(left, 100)); else go();
    }
    function go() {
        window.__appMounted = true;
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ErrorBoundary, null,
            React.createElement(AuthGate, null, React.createElement(App, null))));
        setTimeout(function () { if (window.__hideSplash) window.__hideSplash(); }, 1200);   // jaring pengaman
    }
    tick();
})();
