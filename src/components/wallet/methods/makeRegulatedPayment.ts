import sjcl from "@tinyanvil/sjcl";
import {
  Keypair,
  Transaction,
  TransactionBuilder,
  Networks,
  Server,
  Operation,
  Asset,
  xdr
} from "stellar-sdk";
import { get as loGet } from "lodash-es";
import TOML from "toml";

import { handleError } from "@services/error";

export default async function makeRegulatedPayment(e?: Event) {
  try {
    if (e) e.preventDefault();
    this.loading = { ...this.loading, payRegulated: true };
    const server = new Server("https://horizon-testnet.stellar.org");

    // let instructions = await this.setPrompt("{Amount} {Asset} {Destination}");
    // const [amount, assetCode, destination] = instructions.split(" ");
    const [amount, assetCode, destination] = [
      "20",
      "REG",
      "GA6XFZYMX2V7SSCIYOEYXO3BM45F73XG5VROHPXVCIXWHXIZ3TAUT2V5"
    ];
    const balances: any[] = loGet(this.account, "state.balances");
    const assetBalance = balances.find(
      balance => balance.asset_code === assetCode
    );
    let assetIssuer;
    if (!assetBalance) {
      assetIssuer = await this.setPrompt(
        `Who issues the ${assetCode} asset?`,
        "Enter ME to refer to yourself"
      );
    } else {
      assetIssuer = assetBalance.asset_issuer;
    }

    const pincode = "1119"; //await this.setPrompt("Enter your keystore pincode");
    const keypair = Keypair.fromSecret(
      sjcl.decrypt(pincode, this.account.keystore)
    );
    this.log("Starting to send regulated assets");

    // Find the home_domain so we can get the compliance server
    this.log("Fetching asset issuers data to find the home_domain");
    const issuerAccount = await server.loadAccount(assetIssuer);
    const homeDomain: string = (issuerAccount as any).home_domain;
    this.log(`Fetching toml from the home_domain ${homeDomain}`); // home_domain is missing in stellar_sdk types
    const tomlURL = new URL(homeDomain);
    tomlURL.pathname = "/.well-known/stellar.toml";
    const tomlText = await fetch(tomlURL.toString()).then(r => r.text());
    this.log(`Received TOML<br/><pre>${tomlText}</pre>`);
    const toml = TOML.parse(tomlText);

    const tomlCurrency = toml.CURRENCIES.find(c => c.code === assetCode);
    if (!tomlCurrency || !tomlCurrency.approval_server)
      throw "No approval server for asset";
    const approvalServer = tomlCurrency.approval_server;
    this.log("Found approval server: " + approvalServer);

    const asset = new Asset(assetCode, assetIssuer);
    const account = await server.loadAccount(keypair.publicKey());
    const transaction = new TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination,
          amount,
          asset
        })
      )
      .setTimeout(30)
      .build();
    this.log(
      "Built a transaction to request approval for.  Sending for approval..."
    );
    const approvalUrl = new URL(approvalServer);
    approvalUrl.searchParams.set("tx", transaction.toXDR());
    const json = await fetch(approvalUrl.toString()).then(resp => resp.json());
    this.log("Response from approval server", json);
    //@ts-ignore
    const revisedEnvelope = xdr.TransactionEnvelope.fromXDR(json.tx, "base64");
    //@ts-ignore
    this.log("OPS" + revisedEnvelope.tx().operations());
    const tx = new Transaction(revisedEnvelope, Networks.TESTNET);
    tx.sign(keypair);
    this.log("Submitting signed transaction");
    this.log({
      text: "Signed Transaction (Open in stellar lab)",
      href:
        "https://www.stellar.org/laboratory/#xdr-viewer?input=" +
        encodeURIComponent(tx.toXDR())
    });
    await server.submitTransaction(tx);
    this.log("Succesfully submitted regulated payment!");
    this.loading = { ...this.loading, payRegulated: false };
    this.updateAccount();
  } catch (err) {
    this.error = handleError(err);
  }
}
