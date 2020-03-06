import { h } from "@stencil/core";

export default function LogViewer(messages: string[]) {
  return (
    <div>
      <h1>Logs</h1>
      {messages.map(m => (
        <div class="log">
          > <span innerHTML={m}></span>
        </div>
      ))}
    </div>
  );
}
