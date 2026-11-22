/* Halaman Tools: peluncur ikon (Risk calculator, Alarm, Tampilan aplikasi) + ringkasan (v5.10.1) */
"use strict";
function TlIc({ icon, label, onOpen }) {
    return React.createElement("button", { type: "button", className: "tl-btn", onClick: onOpen },
        React.createElement("span", { className: "tl-ic" }, icon), React.createElement("b", null, label));
}
function TlRow({ label, value, last }) {
    return React.createElement("div", { className: "tl-row" + (last ? " last" : "") }, React.createElement("small", null, label), React.createElement("b", null, value));
}
function Tools({ homeT, onHome, headerVariant, onHeaderVariant, navVariant, onNavVariant, account, onCalcTrade }) {
    const [page, setPage] = useState(null);
    const [alarmOpen, setAlarmOpen] = useState(false);
    const EJ = useAppearance(), al = window.useAlarmSummary ? window.useAlarmSummary() : { on: 0, next: null };
    const go = v => { setPage(v); try { window.scrollTo(0, 0); } catch (e) { } };
    if (page === 'appearance')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Tampilan aplikasi", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-list" },
                React.createElement(AppearanceRows, { homeT: homeT, onHome: onHome, headerVariant: headerVariant, onHeaderVariant: onHeaderVariant, navVariant: navVariant, onNavVariant: onNavVariant })));
    if (page === 'risk')
        return React.createElement("section", null,
            React.createElement(SubHead, { title: "Risk calculator", onBack: () => go(null) }),
            React.createElement("div", { className: "acc-panel sp-panel" }, React.createElement(RiskCalc, { account: account, onTrade: onCalcTrade })));
    const st = EJ.state, th = EJ.THEMES[st.theme], mode = { light: 'Terang', dark: 'Gelap', auto: 'Otomatis' }[st.mode] || '';
    return React.createElement("section", { className: "tl" },
        React.createElement(PageHeading, { title: "Trading Tools", description: "Kalkulator risk, alarm, dan tampilan aplikasi.", className: "relaxed" }),
        React.createElement("div", { className: "tl-launch" },
            React.createElement(TlIc, { icon: React.createElement(Calculator, { size: 30 }), label: "Risk", onOpen: () => go('risk') }),
            React.createElement(TlIc, { icon: React.createElement(Icon, { name: "AlAlarm", size: 30 }), label: "Alarm", onOpen: () => setAlarmOpen(true) }),
            React.createElement(TlIc, { icon: React.createElement(Icon, { name: "Paintbrush", size: 30 }), label: "Tampilan", onOpen: () => go('appearance') })),
        React.createElement("div", { className: "tl-lab" }, "Ringkasan"),
        React.createElement("div", { className: "tl-sum" },
            React.createElement(TlRow, { label: "Alarm berikutnya", value: al.next ? al.next.label + " · " + al.next.dur : "Tidak ada alarm aktif" }),
            React.createElement(TlRow, { label: "Alarm aktif", value: String(al.on) }),
            React.createElement(TlRow, { label: "Tema", value: (th ? th.name : '') + (mode ? " · " + mode : ''), last: true })),
        alarmOpen && window.AlarmPage && React.createElement(window.AlarmPage, { onClose: () => setAlarmOpen(false) }));
}
