import { Component, State, Prop } from "@stencil/core";
import { Server, ServerApi } from "stellar-sdk";

import componentWillLoad from "./events/componentWillLoad"; // UPDATE
import componentDidLoad from "./events/componentDidLoad";
import render from "./events/render"; // UPDATE

import createAccount from "./methods/createAccount";
import updateAccount from "./methods/updateAccount";
import depositAsset from "./methods/depositAsset"; // NEW
import withdrawAsset from "./methods/withdrawAsset"; // NEW
import trustAsset from "./methods/trustAsset";
import makePayment from "./methods/makePayment";
import makeRegulatedPayment from "./methods/makeRegulatedPayment";
import log from "./methods/log";

import copyAddress from "./methods/copyAddress";
import copySecret from "./methods/copySecret";
import signOut from "./methods/signOut";
import setPrompt from "./methods/setPrompt";

import { Prompter } from "@prompt/prompt";

interface StellarAccount {
  publicKey: string;
  keystore: string;
  state?: ServerApi.AccountRecord;
}

interface Loading {
  fund?: boolean;
  pay?: boolean;
  payRegulated?: boolean;
  trust?: boolean;
  update?: boolean;
  deposit?: boolean; // NEW
  withdraw?: boolean; // NEW
}

@Component({
  tag: "stellar-wallet",
  styleUrl: "wallet.scss",
  shadow: true
})
export class Wallet {
  @State() account: StellarAccount;
  @State() prompter: Prompter = { show: false };
  @State() loading: Loading = {};
  @State() error: any = null;
  @State() messages: string[] = [];

  @Prop() server: Server;
  @Prop() homeDomain: String; // NEW
  @Prop() toml: Object; // NEW
  @Prop() secret: String;

  // Component events
  componentWillLoad() {}
  componentDidLoad() {}
  render() {}

  // Stellar methods
  createAccount = createAccount;
  updateAccount = updateAccount;
  depositAsset = depositAsset; // NEW
  withdrawAsset = withdrawAsset; // NEW
  trustAsset = trustAsset;
  makePayment = makePayment;
  makeRegulatedPayment = makeRegulatedPayment;
  copyAddress = copyAddress;
  copySecret = copySecret;
  signOut = signOut;

  // Misc methods
  setPrompt = setPrompt;
  log = log;
}

Wallet.prototype.componentWillLoad = componentWillLoad;
Wallet.prototype.componentDidLoad = componentDidLoad;
Wallet.prototype.render = render;
