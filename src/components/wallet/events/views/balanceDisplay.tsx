import { h } from "@stencil/core";
import { has as loHas } from "lodash-es";

interface Balance {
  balance: string;
  is_authorized: boolean;
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
}

export default function BalanceDisplay() {
  const balanceRow = (balance: Balance) => {
    const revokedAssets: Set<string> = this.revokedAssets;
    const asset = `${balance.asset_code}:${balance.asset_issuer}`;
    const isRevoked = revokedAssets.has(asset);
    console.log(revokedAssets);
    console.log("IS REVOKED", isRevoked, this.account.keypair.publicKey());
    const name = balance.asset_type === "native" ? "XLM" : balance.asset_code;
    return (
      <div class={`balance-row ${isRevoked ? "revoked" : "active"}`}>
        <div class="asset-code">{name}</div>
        <div class="balance">{parseFloat(balance.balance).toFixed(2)}</div>
        <button
          onClick={(e) => this.makePayment(e, name, balance.asset_issuer)}
        >
          Send
        </button>
      </div>
    );
  };
  return (
    <div>
      {loHas(this.account, "state") ? (
        <pre class="account-state">
          {this.account.state.balances.map(balanceRow)}
        </pre>
      ) : null}
    </div>
  );
}
