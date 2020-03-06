import { h } from "@stencil/core";
import Identicon from "identicon.js";
import { StellarAccount } from "../../types";
import copy from "copy-to-clipboard";

function convertToHex(str) {
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16);
  }
  return hex;
}

export default function AccountHeader(account: StellarAccount) {
  const iconSize = 48;

  const icon = new Identicon(convertToHex(account.publicKey), {
    size: iconSize,
    background: [255, 255, 255, 255]
  }).toString();

  const acctDisplay =
    account.publicKey.substring(0, 5) +
    "..." +
    account.publicKey.substring(51, 56);

  return (
    <div class="account-key">
      <div>
        <img
          width={iconSize}
          height={iconSize}
          src={`data:image/png;base64,${icon}`}
        />
      </div>
      <div>{acctDisplay}</div>
      <button
        class="small"
        onClick={e => {
          copy(account.publicKey);
          const el = e.target as Element;
          el.textContent = "copied";
          setTimeout(() => (el.textContent = "Copy"), 1000);
        }}
      >
        Copy
      </button>
    </div>
  );
}
