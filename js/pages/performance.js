/* Halaman Performance */
"use strict";
function Performance({ onSelectDate, onWallet, account, trades, period, setPeriod, customStart, customEnd, setCustomStart, setCustomEnd }) {
    const [rangeOpen, setRangeOpen] = useState(false);
    const [performanceView, setPerformanceView] = useState('overview');
    const [shareOpen, setShareOpen] = useState(false);
    const [shareHide, setShareHide] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const shareBlob = useRef(null);
    const [draft, setDraft] = useState({ s: '', e: '' });
    const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
    useEffect(() => { if (performanceView !== 'overview')
        window.scrollTo({ top: 0, behavior: 'auto' }); }, [performanceView]);
    useEffect(() => { const h = () => { setPerformanceView('overview'); window.scrollTo({ top: 0, behavior: 'auto' }); }; window.addEventListener('perf-home', h); return () => window.removeEventListener('perf-home', h); }, []);
    useEffect(() => { if (performanceView === 'overview' && rangeOpen) { setRangeOpen(false); if (!customStart && !customEnd)
        setPeriod('All time'); } }, [performanceView]);
    const pickMonth = (y, m) => { const p2 = n => String(n).padStart(2, '0'); setView({ y, m }); setCustomStart(`${y}-${p2(m + 1)}-01`); setCustomEnd(`${y}-${p2(m + 1)}-${p2(new Date(y, m + 1, 0).getDate())}`); setPeriod('Custom date range'); };
    const filtered = trades.filter(t => t.status === 'closed' && withinPeriod(t.date, period, customStart, customEnd));
    const total = filtered.reduce((a, t) => a + (Number(t.pnl) || 0), 0);
    const wins = filtered.filter(t => t.pnl > 0);
    const losses = filtered.filter(t => t.pnl < 0);
    const winRate = filtered.length ? Math.round(wins.length / filtered.length * 100) : 0;
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnl, 0) / losses.length : 0;
    const pct = (value, base) => base ? `${value >= 0 ? '+' : ''}${(value / base * 100).toFixed(2)}%` : '0.00%';
    let equity = account.balance, high = equity, maxDd = 0;
    const curve = [];
    filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => { equity += Number(t.pnl) || 0; high = Math.max(high, equity); maxDd = Math.max(maxDd, high - equity); curve.push({ date: t.date, equity }); });
    let run = 0, peak = 0;
    filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => { run += Number(t.pnl) || 0; peak = Math.max(peak, run); });
    const hwm = peak;
    const points = curve.length ? curve.map((p, i) => { const min = Math.min(...curve.map(x => x.equity), account.balance); const max = Math.max(...curve.map(x => x.equity), account.balance + 1); return `${curve.length === 1 ? 250 : (i / (curve.length - 1)) * 500},${145 - ((p.equity - min) / (max - min || 1)) * 125}`; }).join(' ') : '0,145 100,135 200,140 300,115 400,120 500,95';
    const bySymbol = SYMBOLS.map(symbol => { const xs = filtered.filter(t => t.symbol === symbol); return { symbol, count: xs.length, pnl: xs.reduce((a, t) => a + t.pnl, 0) }; }).filter(x => x.count);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => { const xs = filtered.filter(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }) === day); return { day, count: xs.length, wins: xs.filter(t => t.pnl > 0).length, losses: xs.filter(t => t.pnl < 0).length, pnl: xs.reduce((a, t) => a + (Number(t.pnl) || 0), 0) }; }).filter(x => x.count).sort((a, b) => b.pnl - a.pnl);
    const cdH = account.capitalHistory || [];
    const depS = cdH.filter(h => h.type !== 'withdraw').reduce((a, h) => a + (Number(h.amount) || 0), 0), wdS = cdH.filter(h => h.type === 'withdraw').reduce((a, h) => a + (Number(h.amount) || 0), 0);
    const startBal = Math.max((account.balance || 0) - depS + wdS, 1);
    const activeDays = new Set(filtered.map(t => dateOnly(t.date))).size;
    const growthPct = total / startBal * 100;
    const cs = filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    let cr = 0;
    const cv = [0, ...cs.map(t => (cr += Number(t.pnl) || 0))];
    const clo = Math.min(...cv), chi = Math.max(...cv), csp = (chi - clo) || 1;
    const cn = cv.length;
    const cpts = cv.map((v, i) => `${cn === 1 ? 0 : i / (cn - 1) * 500},${12 + (chi - v) / csp * 100}`);
    const cy0 = 12 + (chi - 0) / csp * 100;
    const ccol = cr >= 0 ? '#34d399' : '#ff6b81';
    const mm = {};
    cs.forEach(t => { const k = dateOnly(t.date).slice(0, 7); mm[k] = (mm[k] || 0) + (Number(t.pnl) || 0); });
    const mKs = Object.keys(mm);
    const bestMk = mKs.length ? mKs.reduce((a, b) => mm[b] > mm[a] ? b : a) : null;
    const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const aTotal = useCountUp(total), aNow = useCountUp(account.balance + total), aGrowth = useCountUp(growthPct);
    const gW0 = sumOf(wins, t => t.pnl), gL0 = Math.abs(sumOf(losses, t => t.pnl));
    const pf0 = gL0 ? gW0 / gL0 : (gW0 ? Infinity : 0);
    const rr0 = cs.map(t => { const r = riskFor(t.entry, t.sl, t.lots, t.symbol), w = rewardFor(t.entry, t.tp, t.lots, t.symbol); return r && w ? w / r : null; }).filter(Boolean);
    const avgRR0 = rr0.length ? rr0.reduce((a, b) => a + b, 0) / rr0.length : null;
    const pips0 = cs.reduce((a, t) => a + pipsOf(t), 0);
    const dm0 = {};
    cs.forEach(t => { const k = dateOnly(t.date); dm0[k] = (dm0[k] || 0) + (Number(t.pnl) || 0); });
    const dvals0 = Object.values(dm0);
    const bd0 = dvals0.length ? Math.max(...dvals0) : 0;
    const cLabels = ['Awal', ...cs.map(t => new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }))];
    const sgn = v => v > 0.005 ? '+' : '';
    const heroFx = ddStat(ddBuild(filtered));   // sama dengan kartu Performa per bulan: minggu, hari, sesi, posisi
    const bestTxt = bestMk ? `${MS[Number(bestMk.slice(5, 7)) - 1]} ${mm[bestMk] >= 0 ? '+' : ''}${(mm[bestMk] / startBal * 100).toFixed(1)}%` : '—';
    const ddTxt = maxDd ? `-${(maxDd / (account.balance || 1) * 100).toFixed(1)}%` : '0%';
    const periodTxt = period === 'Custom date range' && customStart && customEnd ? `${fmtLong(customStart)} – ${fmtLong(customEnd)}` : period;
    const periodBlock = React.createElement(React.Fragment, null,
        React.createElement("div", { className: "section-row detail-period-row" },
            React.createElement("div", null,
                React.createElement("h2", null, "Periode"),
                React.createElement("small", null, "Atur rentang analisis")),
            React.createElement("div", { className: "period-controls" },
                React.createElement(TSelect, { title: "Periode", value: period, options: ['All time', 'Year-to-date', 'Weekly', 'Monthly', 'Custom date range'], onChange: v => { setPeriod(v); if (v === 'Custom date range') {
                            setDraft({ s: customStart || '', e: customEnd || '' });
                            setRangeOpen(true);
                        }
                        else if (v === 'Monthly') {
                            const n = new Date();
                            setView({ y: n.getFullYear(), m: n.getMonth() });
                        } } }))),
        period === 'Custom date range' && customStart && customEnd && React.createElement("div", { className: "pe-banner" },
            React.createElement("span", null,
                "Menampilkan: ",
                React.createElement("b", null,
                    fmtLong(customStart),
                    " – ",
                    fmtLong(customEnd))),
            React.createElement("button", { onClick: () => setPeriod('All time') }, "Semua waktu")));
    useEffect(() => { if (!shareOpen)
        return; let dead = false, url = null; Promise.race([document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 800))]).then(() => { if (dead)
        return; const cvn = drawShareImage({ account: account.name, total, growthPct, start: startBal, now: account.balance + total, days: activeDays, vals: cv, labels: cLabels, best: bestTxt, dd: ddTxt, periodText: periodTxt, hide: shareHide, fmt: v => money(v, account.currency) }); cvn.toBlob(b => { if (dead || !b)
        return; shareBlob.current = b; url = URL.createObjectURL(b); setShareUrl(url); }, 'image/png'); }); return () => { dead = true; if (url)
        URL.revokeObjectURL(url); }; }, [shareOpen, shareHide, total, growthPct, period, customStart, customEnd, account.name, cn, cr]);
    const saveShare = () => { if (!shareUrl)
        return; if (capNative() && shareBlob.current) { nativeShareBlob(shareBlob.current, `edge-journal-${dateOnly(isoNow())}.png`, 'Simpan atau bagikan gambar').catch(e => { if (!/cancel/i.test(String((e && e.message) || e))) notify('Gagal membuka menu bagikan: ' + ((e && e.message) || e)); }); return; } const a = document.createElement('a'); a.href = shareUrl; a.download = `edge-journal-${dateOnly(isoNow())}.png`; document.body.appendChild(a); a.click(); a.remove(); notify('Gambar disimpan. Buka WhatsApp atau Instagram lalu pilih dari galeri.'); };
    const doShare = async () => { const b = shareBlob.current; if (!b)
        return; const f = new File([b], 'edge-journal.png', { type: 'image/png' }); if (capNative()) { try { await nativeShareBlob(b, 'edge-journal.png', 'Bagikan ke story'); } catch (e) { if (!/cancel/i.test(String((e && e.message) || e))) notify('Gagal membuka menu bagikan: ' + ((e && e.message) || e)); } return; } try {
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
            await navigator.share({ files: [f], title: 'Edge Journal', text: 'Hasil trading saya' });
            return;
        }
    }
    catch (e) {
        if (e && e.name === 'AbortError')
            return;
    } saveShare(); };
    return React.createElement("section", { className: `performance-page ${performanceView === 'overview' ? 'performance-overview-page' : 'performance-detail-wrap'}` },
        performanceView === 'overview' && React.createElement("div", { className: "perf-screen" },
            React.createElement("div", { className: "hero-card combo hv-d" },
                React.createElement("div", { className: "combo-top" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "label" }, "TOTAL P&L"),
                        React.createElement("div", { className: total >= 0 ? 'hero-number positive' : 'hero-number negative' },
                            sgn(aTotal),
                            money(aTotal, account.currency)),
                        React.createElement("span", { className: `trend ${total >= 0 ? 'positive' : 'negative'}` },
                            total >= 0 ? React.createElement(ArrowUpRight, { size: 15 }) : React.createElement(ArrowDownRight, { size: 15 }),
                            " ",
                            account.balance ? `${total >= 0 ? '+' : ''}${((total / account.balance) * 100).toFixed(2)}%` : '0.00%',
                            " in selected period")),
                    React.createElement("div", { className: "hero-account" },
                        React.createElement("span", null, "ACTIVE ACCOUNT"),
                        React.createElement("strong", null, account.name),
                        React.createElement("button", { className: "header-icon wallet-inline", onClick: onWallet, "aria-label": "Deposit dan Withdraw" },
                            React.createElement(Wallet, { size: 17 })))),
                React.createElement("div", { className: "hero-facts", "aria-label": "Rincian periode" }, [[heroFx.weeks, 'minggu'], [heroFx.days, 'hari'], [heroFx.sessions, 'sesi'], [heroFx.n, 'posisi']].map(([v, l]) => React.createElement("span", { key: l },
                    React.createElement("b", null, v),
                    " " + l))),
                React.createElement("div", { className: "combo-stats" },
                    React.createElement("div", null,
                        React.createElement("span", null, "Saldo awal"),
                        React.createElement("b", null, money(startBal, account.currency))),
                    React.createElement("div", null,
                        React.createElement("span", null, "Sekarang"),
                        React.createElement("b", { className: total >= 0 ? 'positive' : 'negative' }, money(aNow, account.currency))),
                    React.createElement("div", null,
                        React.createElement("span", null, "Pertumbuhan"),
                        React.createElement("b", { className: growthPct >= 0 ? 'positive' : 'negative' },
                            sgn(aGrowth),
                            aGrowth.toFixed(2),
                            "%")),
                    React.createElement("div", null,
                        React.createElement("span", null, "Hari aktif"),
                        React.createElement("b", null, activeDays))),
                React.createElement(HeroChart, { trades: cs, line: React.createElement(ComboChart, { key: `${cn}:${cr}`, vals: cv, labels: cLabels, col: ccol, fmt: v => `${v > 0 ? '+' : ''}${money(v, account.currency)}` }) }),
                React.createElement("div", { className: "combo-legend" },
                    React.createElement("span", null,
                        React.createElement("i", { style: { background: '#34d399' } }),
                        "Bulan terbaik: ",
                        React.createElement("b", null, bestMk ? `${MS[Number(bestMk.slice(5, 7)) - 1]} ${mm[bestMk] >= 0 ? '+' : ''}${(mm[bestMk] / startBal * 100).toFixed(1)}%` : '—')),
                    React.createElement("span", null,
                        React.createElement("i", { style: { background: '#ff6b81' } }),
                        "Drawdown terdalam: ",
                        React.createElement("b", null, maxDd ? `-${(maxDd / (account.balance || 1) * 100).toFixed(1)}%` : '0%'))),
                React.createElement("div", { className: "combo-mini" }, [['Win rate', `${winRate}%`, filtered.length ? (winRate >= 50 ? 'positive' : 'negative') : ''], ['Profit Factor', pf0 === Infinity ? '∞' : pf0.toFixed(2), filtered.length ? (pf0 >= 1 ? 'positive' : 'negative') : ''], ['Total Trades', String(filtered.length), ''], ['Avg. R:R', avgRR0 ? avgRR0.toFixed(1) : '—', ''], ['Perolehan Pips', `${pips0 > 0 ? '+' : ''}${pips0.toFixed(1)}`, pips0 > 0 ? 'positive' : pips0 < 0 ? 'negative' : ''], ['Best Day', bd0 > 0 ? `+${money(bd0, account.currency)}` : '—', bd0 > 0 ? 'positive' : '']].map(([l, v, t]) => React.createElement("div", { key: l },
                    React.createElement("span", null, l),
                    React.createElement("b", { className: t }, v)))),
                React.createElement("div", { className: "performance-actions" },
                    React.createElement("button", { type: "button", className: "performance-action share-btn", onClick: () => setShareOpen(true) },
                    React.createElement(Share2, { size: 15 }),
                    " Bagikan ke story"),
                    React.createElement("button", { type: "button", className: "performance-action detail-action-btn", onClick: () => setPerformanceView('advanced') },
                        React.createElement(BarChart3, { size: 16 }),
                        " Advanced Statistics"),
                    React.createElement("button", { type: "button", className: "performance-action detail-action-btn dna-action-btn", onClick: () => setPerformanceView('dna') },
                        React.createElement(Activity, { size: 16 }),
                        " Trader DNA")))),
        performanceView !== 'overview' && React.createElement("div", { className: "performance-detail-page" },
            React.createElement("div", { className: "performance-detail-inner" },
                React.createElement("div", { className: "cal-top performance-detail-top" },
                    React.createElement("button", { className: "icon-btn", onClick: () => setPerformanceView('overview'), "aria-label": "Kembali ke Performance" },
                        React.createElement(ChevronLeft, { size: 18 })),
                    React.createElement("div", { className: "performance-detail-heading" },
                        React.createElement("strong", null, performanceView === 'advanced' ? 'Advanced Statistics' : 'Trader DNA'),
                        React.createElement("span", null, `Analisis ${period.toLowerCase()} · ${account.name}`)),
                    React.createElement("span", { className: "performance-detail-badge" }, performanceView === 'advanced' ? 'STAT' : 'DNA')),
                periodBlock,
                performanceView === 'advanced' && React.createElement(AdvancedStats, { account: account, filtered: filtered, total: total, maxDd: maxDd, hwm: hwm, view: view, part: 'title' }),
                performanceView === 'advanced' && React.createElement(PerfExtra, { account: account, trades: trades, filtered: filtered, total: total, maxDd: maxDd, onSelectDate: onSelectDate, view: view, onPickMonth: pickMonth, onResetAll: () => setPeriod('All time'), rangeText: periodTxt, mode: 'advanced', advancedStats: React.createElement(AdvancedStats, { account: account, filtered: filtered, total: total, maxDd: maxDd, hwm: hwm, view: view, part: 'card' }) }),
                performanceView === 'dna' && React.createElement(PerfExtra, { account: account, trades: trades, filtered: filtered, total: total, maxDd: maxDd, onSelectDate: onSelectDate, view: view, onPickMonth: pickMonth, onResetAll: () => setPeriod('All time'), rangeText: periodTxt, mode: 'dna' }))),
        shareOpen && ReactDOM.createPortal(React.createElement("div", { className: "modal-backdrop center top", onClick: e => { if (e.target === e.currentTarget) {
                setShareOpen(false);
                setShareUrl('');
            } } },
            React.createElement("div", { className: "share-sheet" },
                React.createElement("div", { className: "tsel-title" }, "Bagikan ke Story"),
                shareUrl ? React.createElement("img", { src: shareUrl, className: "share-img", alt: "Pratinjau gambar" }) : React.createElement("div", { className: "pe-empty" }, "Menyiapkan gambar\u2026"),
                React.createElement("label", { className: "share-opt" },
                    React.createElement("input", { type: "checkbox", checked: shareHide, onChange: e => { setShareUrl(''); setShareHide(e.target.checked); } }),
                    " Sembunyikan nominal uang (tampilkan persen saja)"),
                React.createElement("div", { className: "dp-actions share-actions" },
                    React.createElement("button", { type: "button", onClick: () => { setShareOpen(false); setShareUrl(''); } }, "Tutup"),
                    React.createElement("button", { type: "button", onClick: saveShare }, "Simpan"),
                    React.createElement("button", { type: "button", className: "primary", onClick: doShare }, "Bagikan")))), document.body),
        rangeOpen && performanceView !== 'overview' && React.createElement("div", { className: "modal-backdrop center top" },
            React.createElement("div", { className: "range-dialog" },
                React.createElement("h3", null, "Custom Date Range"),
                React.createElement("label", null,
                    "Start Date",
                    React.createElement(DateField, { value: draft.s, onChange: v => setDraft({ ...draft, s: v }) })),
                React.createElement("label", null,
                    "End Date",
                    React.createElement(DateField, { value: draft.e, min: draft.s || undefined, onChange: v => setDraft({ ...draft, e: v }) })),
                React.createElement("div", { className: "range-actions" },
                    React.createElement("button", { onClick: () => { setRangeOpen(false); if (!customStart && !customEnd)
                            setPeriod('All time'); } }, "Cancel"),
                    React.createElement("button", { className: "ok", onClick: () => { if (!draft.s || !draft.e) {
                            notify('Isi tanggal mulai dan akhir.');
                            return;
                        } if (draft.e < draft.s) {
                            notify('Tanggal akhir harus setelah tanggal mulai.');
                            return;
                        } setCustomStart(draft.s); setCustomEnd(draft.e); setView({ y: Number(draft.s.slice(0, 4)), m: Number(draft.s.slice(5, 7)) - 1 }); setRangeOpen(false); } }, "Confirm")))));
}
