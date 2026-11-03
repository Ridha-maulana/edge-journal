/* Halaman Tools (Risk calculator, pilihan tampilan header dan menu bawah) */
"use strict";
function Tools({ headerVariant, onHeaderVariant, navVariant, onNavVariant, account, onCalcTrade }) {
    const [calcOpen, setCalcOpen] = useState(false);
    return React.createElement("section", null,
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk dan reward.", className: "relaxed" }),
        React.createElement("div", { className: "acc-list" },
            React.createElement(AccRow, { icon: React.createElement(Calculator, { size: 18 }), title: "Risk calculator", desc: "Hitung risk, reward, dan ukuran lot", open: calcOpen, onToggle: () => setCalcOpen(!calcOpen) },
                React.createElement(RiskCalc, { account: account, onTrade: onCalcTrade })),
            React.createElement(HeaderPicker, { value: headerVariant || 0, onChange: onHeaderVariant }),
            React.createElement(NavPicker, { value: navVariant || 0, onChange: onNavVariant })));
}
