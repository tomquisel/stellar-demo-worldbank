import { Component, State, Prop } from "@stencil/core";
import { Server } from "stellar-sdk";

import { StellarAccount } from "./types";

import componentWillLoad from "./events/componentWillLoad"; // UPDATE
import render from "./events/render"; // UPDATE

import updateAccount from "./methods/updateAccount";
import depositAsset from "./methods/depositAsset"; // NEW
import withdrawAsset from "./methods/withdrawAsset"; // NEW
import trustAsset from "./methods/trustAsset";
import makePayment from "./methods/makePayment";
import makeRegulatedPayment from "./methods/makeRegulatedPayment";
import log from "./methods/log";
import checkRevocationStatus from "./methods/checkRevocationStatus";

import copyAddress from "./methods/copyAddress";
import setPrompt from "./methods/setPrompt";

import balanceDisplay from "./events/views/balanceDisplay";

import { Prompter } from "@prompt/prompt";

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
  @State() revokedAssets: Set<string> = new Set();

  @Prop() server: Server;
  @Prop() homeDomain: String; // NEW
  @Prop() toml: Object; // NEW
  @Prop() secretKey: string;

  // Component events
  componentWillLoad() {}
  render() {}

  // Stellar methods
  updateAccount = updateAccount;
  depositAsset = depositAsset; // NEW
  withdrawAsset = withdrawAsset; // NEW
  trustAsset = trustAsset;
  makePayment = makePayment;
  makeRegulatedPayment = makeRegulatedPayment;
  copyAddress = copyAddress;
  checkRevocationStatus = checkRevocationStatus;

  // Misc methods
  setPrompt = setPrompt;
  log = log;

  balanceDisplay = balanceDisplay;
}

Wallet.prototype.componentWillLoad = componentWillLoad;
Wallet.prototype.render = render;
