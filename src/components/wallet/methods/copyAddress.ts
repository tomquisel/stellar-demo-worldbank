import copy from "copy-to-clipboard";

export default async function copyAddress(e: Event) {
  e.preventDefault();
  debugger;
  copy(this.account.publicKey);
}
