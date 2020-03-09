import { Server, StellarTomlResolver, Keypair } from "stellar-sdk";
import { handleError } from "@services/error";

export default async function componentWillLoad() {
  try {
    this.error = null;
    this.server = new Server("https://horizon-testnet.stellar.org");
    this.homeDomain = "testanchor.stellar.org";
    this.toml = await StellarTomlResolver.resolve(this.homeDomain);
    if (!this.secretKey) alert("Missing secret key for wallet");
    const keypair = Keypair.fromSecret(this.secretKey);
    this.account = {
      publicKey: keypair.publicKey(),
      keypair
    };
    this.updateAccount();

    window.addEventListener("focus", () => {
      console.log("Focus", this);
      this.checkRevocationStatus();
    });
  } catch (err) {
    this.error = handleError(err);
  }
}
