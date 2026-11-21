/* Halaman Tools (Risk calculator, Alarm, pilihan tampilan header dan menu bawah) */
"use strict";
function Tools({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant, account, onCalcTrade }) {
    const [calcOpen, setCalcOpen] = useState(false);
    return React.createElement("section", null,
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk, reward, dan alarm.", className: "relaxed" }),
        React.createElement("div", { className: "acc-list" },
            React.createElement(AccRow, { icon: React.createElement(Calculator, { size: 18 }), title: "Risk calculator", desc: "Hitung risk, reward, dan ukuran lot", open: calcOpen, onToggle: () => setCalcOpen(!calcOpen) },
                React.createElement(RiskCalc, { account: account, onTrade: onCalcTrade })),
            React.createElement(AlarmRow, null),
            React.createElement(AppearanceRows, { homeT: homeT, onHome: onHome, headerVariant: headerVariant, onHeaderVariant: onHeaderVariant, navVariant: navVariant, onNavVariant: onNavVariant })));
}
