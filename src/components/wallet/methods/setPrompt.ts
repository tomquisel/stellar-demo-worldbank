export default function setPrompt(
  message: string,
  placeholder?: string,
  options?: Array<any>,
  info?: string
): Promise<string> {
  this.prompter = {
    ...this.prompter,
    show: true,
    message,
    placeholder,
    options,
    info
  };

  return new Promise((resolve, reject) => {
    this.prompter.resolve = resolve;
    this.prompter.reject = reject;
  });
}
