import {
  Transaction,
  TransactionBuilder,
  Networks,
  Server,
  Operation,
  Asset,
  xdr
} from "stellar-sdk";
import TOML from "toml";

import { handleError } from "@services/error";

function makeTransactionSummary(tx: Transaction): string {
  return `<div class="code-set">${JSON.stringify(
    tx.operations,
    null,
    2
  )}</div>`;
}

export default async function makeRegulatedPayment(
  e?: Event,
  assetCode?: string,
  assetIssuer?: string
) {
  try {
    if (e) e.preventDefault();
    this.loading = { ...this.loading, payRegulated: true };
    const server = new Server("https://horizon-testnet.stellar.org");
    let instructions = await this.setPrompt("{Amount} {Destination}");
    const [amount, destination] = instructions.split(" ");

    const keypair = this.account.keypair;
    this.log(
      `Sending ${amount} <a href="https://stellar.expert/explorer/testnet/asset/${assetCode}-${assetIssuer}" target="_blank">${assetCode}</a> to <a href="https://stellar.expert/explorer/testnet/account/${destination}" target="_blank">${destination}</a>`
    );

    // Find the home_domain so we can get the compliance server
    this.log(
      `Fetching <a href="https://stellar.expert/explorer/testnet/account/${assetIssuer}" target="_blank">asset issuers data</a> to find the home_domain`
    );
    const issuerAccount = await server.loadAccount(assetIssuer);
    const homeDomain: string = (issuerAccount as any).home_domain;
    const tomlURL = new URL(homeDomain);
    tomlURL.pathname = "/.well-known/stellar.toml";
    const tomlText = await fetch(tomlURL.toString()).then(r => r.text());
    this.log(
      `Received TOML from ${tomlURL.toString()}<br/><div class="code-set">${tomlText}</div>`
    );
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
      "Built a transaction to request approval for:" +
        makeTransactionSummary(transaction)
    );
    const approvalUrl = new URL(approvalServer);
    approvalUrl.searchParams.set("tx", transaction.toXDR());
    const json = await fetch(approvalUrl.toString()).then(resp => resp.json());
    this.log("Response from approval server: " + json.status);
    if (json.status === "rejected") {
      this.log("❌ Proposed transaction rejected with error: " + json.error);
      this.loading = { ...this.loading, payRegulated: false };
      return;
    }
    //@ts-ignore
    const revisedEnvelope = xdr.TransactionEnvelope.fromXDR(json.tx, "base64");
    const revisedTx = new Transaction(revisedEnvelope);
    this.log(
      "<b>Revised Transaction from compliance server</b>" +
        makeTransactionSummary(revisedTx)
    );
    try {
      await this.setPrompt(
        "Confirm revised transaction from compliance server?",
        "Just press ok or cancel",
        null,
        "<pre>" + makeTransactionSummary(revisedTx) + "</pre>"
      );
    } catch (e) {
      this.log("❌ Not signing the revised transaction, nothing happens");
      this.loading = { ...this.loading, payRegulated: false };
      return;
    }
    const tx = new Transaction(revisedEnvelope, Networks.TESTNET);
    tx.sign(keypair);
    const labURL = `https://www.stellar.org/laboratory/#xdr-viewer?input=${encodeURIComponent(
      tx.toXDR()
    )}`;
    this.log(
      `Submitting <a href="${labURL}" target="_blank">Signed Transaction (Open in stellar lab)</a>`
    );

    const { hash: txHash } = await server.submitTransaction(tx);
    this.log(
      `✅ Succesfully submitted regulated payment in transaction <a href="https://stellar.expert/explorer/testnet/tx/${txHash}" target="_blank">${txHash.substr(
        0,
        8
      )}</a>!`
    );
    this.loading = { ...this.loading, payRegulated: false };
    this.updateAccount();
  } catch (err) {
    console.log("ERR", err);
    this.error = handleError(err);
  }
}
