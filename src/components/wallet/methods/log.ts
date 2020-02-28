type LinkDetail = {
  href: string;
  text: string;
};

type HTMLDetail = {
  html: string;
};

function isLinkDetail(
  obj: string | LinkDetail | HTMLDetail
): obj is LinkDetail {
  return (obj as LinkDetail).href !== undefined;
}

function isHTMLDetail(
  obj: string | LinkDetail | HTMLDetail
): obj is HTMLDetail {
  return (obj as LinkDetail).html !== undefined;
}
export default function log(message: string | LinkDetail | HTMLDetail) {
  console.log(message);
  if (isLinkDetail(message)) {
    this.messages = [
      ...this.messages,
      `<a href=${message.href} target="_blank">ss${message.text}</a>`
    ];
  } else {
    this.messages = [...this.messages, message];
  }
}
