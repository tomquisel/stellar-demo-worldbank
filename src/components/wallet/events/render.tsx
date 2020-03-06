import { h } from "@stencil/core";
import AccountHeader from "./views/accountHeader";
import LogViewer from "./views/logViewer";

export default function render() {
  return [
    <div class="container" style={{ position: "relative" }}>
      <div class="wallet">
        <stellar-prompt prompter={this.prompter} />
        {AccountHeader(this.account)}
        {this.balanceDisplay()}
        <button
          class={this.loading.update ? "loading" : ""}
          type="button"
          onClick={e => this.updateAccount(e)}
        >
          {this.loading.update ? <stellar-loader /> : null} Refresh
        </button>
        <button
          class={this.loading.trust ? "loading" : null}
          type="button"
          style={{ marginLeft: "8px" }}
          onClick={e => this.trustAsset(e)}
        >
          {this.loading.trust ? <stellar-loader /> : null} + Add Trustline
        </button>
      </div>
      <div class="log-viewer">{LogViewer(this.messages)}</div>
    </div>,
    this.error ? (
      <pre class="error">{JSON.stringify(this.error, null, 2)}</pre>
    ) : null
  ];
}
