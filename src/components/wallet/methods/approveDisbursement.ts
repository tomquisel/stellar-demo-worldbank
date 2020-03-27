import { handleError } from "@services/error";

export default async function makePayment(e?: Event) {
  try {
    if (e) e.preventDefault();

    let requestId = await this.setPrompt("Disbursment request hash/id");
    this.log(`Approved disbursement request ${requestId}.`);
    this.log(`Sending disbursement via bank wire`);
  } catch (err) {
    this.error = handleError(err);
  }
}
