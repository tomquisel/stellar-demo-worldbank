import { handleError } from "@services/error";

export default async function makePayment(e?: Event) {
  try {
    if (e) e.preventDefault();

    // for now we just ignore the receipt, this is a basic demo
    await this.setPrompt("Submit receipt(s):");
    this.log(`Submitted. Disbursement request hash: 52f90f`);
  } catch (err) {
    this.error = handleError(err);
  }
}
