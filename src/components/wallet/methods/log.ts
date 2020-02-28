export default function log(message: string) {
  console.log(message);
  this.messages = [...this.messages, message];
}
