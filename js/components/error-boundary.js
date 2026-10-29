/* Pembungkus error React */
"use strict";
class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(err) { return { err }; }
    render() { if (this.state.err)
        return React.createElement("div", { style: { padding: 24, color: '#ff9aa8', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' } },
            "Terjadi error: ",
            String(this.state.err && this.state.err.stack || this.state.err)); return this.props.children; }
}
