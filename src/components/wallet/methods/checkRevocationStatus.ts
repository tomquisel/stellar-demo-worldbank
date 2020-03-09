import { Asset } from "stellar-sdk";
import approvalServerForAsset from "../util/approvalServerForAsset";
export default async function checkRevocationStatus() {
  console.log("Checking revocation status", this.account);
  const account = this.account;
  const balances = account.state.balances;
  for (var i = 0; i < balances.length; i++) {
    const balance = balances[i];
    if (balance.is_authorized === false) {
      const approvalServer = await approvalServerForAsset(
        new Asset(balance.asset_code, balance.asset_issuer)
      );
      const url =
        approvalServer +
        "/status?stellarAccount=" +
        account.keypair.publicKey();
      const { status } = await fetch(url).then(r => r.json());
      console.log(account.keypair.publicKey(), status);
      const newRevokedAssets = new Set(this.revokedAssets);
      const asset = `${balance.asset_code}:${balance.asset_issuer}`;
      if (status === "revoked") {
        newRevokedAssets.add(asset);
      } else {
        newRevokedAssets.delete(asset);
      }
      this.revokedAssets = newRevokedAssets;
    }
  }
}
