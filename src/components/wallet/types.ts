import { ServerApi, Keypair } from "stellar-sdk";

export interface StellarAccount {
  publicKey: string;
  keypair: Keypair;
  state?: ServerApi.AccountRecord;
}
