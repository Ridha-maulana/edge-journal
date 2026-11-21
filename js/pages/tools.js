/* Halaman Tools: Risk calculator, Alarm, dan Tampilan aplikasi (halaman sendiri, v5.9.97) */
"use strict";
function Tools({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant, account, onCalcTrade }) {
    const [calcOpen, setCalcOpen] = useState(false);
    const [page, setPage] = useState(null);
    const go = v => { setPage(v); try { window.scrollTo(0, 0); } catch (e) { } };
    if (page === 'appearance')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Tampilan aplikasi", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-list" },
                React.createElement(AppearanceRows, { homeT: homeT, onHome: onHome, headerVariant: headerVariant, onHeaderVariant: onHeaderVariant, navVariant: navVariant, onNavVariant: onNavVariant })));
    return React.createElement("section", null,
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk, alarm, dan tampilan aplikasi.", className: "relaxed" }),
        React.createElement("div", { className: "acc-list" },
            React.createElement(AccRow, { icon: React.createElement(Calculator, { size: 18 }), title: "Risk calculator", desc: "Hitung risk, reward, dan ukuran lot", open: calcOpen, onToggle: () => setCalcOpen(!calcOpen) },
                React.createElement(RiskCalc, { account: account, onTrade: onCalcTrade })),
            React.createElement(AlarmRow, null),
            React.createElement(AppearanceEntry, { onOpen: () => go('appearance') })));
}
