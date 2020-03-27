import {
  Account,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Operation,
  Asset,
  Memo,
  MemoType,
} from "stellar-sdk";
import { has as loHas } from "lodash-es";

import { handleError } from "@services/error";

export default async function makePayment(
  e?: Event,
  assetCode?: string,
  issuer?: string
) {
  try {
    if (e) e.preventDefault();

    let instructions = await this.setPrompt("{Amount} {Destination} {memo?}");
    const [amount, destination, memo] = instructions.split(" ");
    const keypair = this.account.keypair;

    this.error = null;
    this.loading = { ...this.loading, pay: true };
    const asset =
      assetCode === "XLM" ? Asset.native() : new Asset(assetCode, issuer);
    await this.server
      .accounts()
      .accountId(keypair.publicKey())
      .call()
      .then(({ sequence }) => {
        const account = new Account(keypair.publicKey(), sequence);
        const transaction = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
          memo: memo ? new Memo<MemoType.Text>("text", memo) : null,
        })
          .addOperation(
            Operation.payment({
              destination,
              asset,
              amount,
            })
          )
          .setTimeout(0)
          .build();

        this.log(
          `Sending ${amount} ${assetCode} to ${destination.slice(0, 5)}${
            memo ? " (Memo: " + memo + ")" : ""
          }`
        );

        transaction.sign(keypair);
        return this.server.submitTransaction(transaction).catch((err) => {
          if (
            // Paying an account which doesn't exist, create it instead
            loHas(err, "response.data.extras.result_codes.operations") &&
            err.response.data.status === 400 &&
            err.response.data.extras.result_codes.operations.indexOf(
              "op_no_destination"
            ) !== -1 &&
            !instructions[3]
          ) {
            const transaction = new TransactionBuilder(account, {
              fee: BASE_FEE,
              networkPassphrase: Networks.TESTNET,
            })
              .addOperation(
                Operation.createAccount({
                  destination: instructions[2],
                  startingBalance: instructions[0],
                })
              )
              .setTimeout(0)
              .build();

            transaction.sign(keypair);
            return this.server.submitTransaction(transaction);
          } else throw err;
        });
      })
      .then((res) => this.log(`Success! Transaction hash: ${res.hash}`))
      .finally(() => {
        this.loading = { ...this.loading, pay: false };
        this.updateAccount();
      });
  } catch (err) {
    this.error = handleError(err);
  }
}
