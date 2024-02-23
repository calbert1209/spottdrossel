import { fetchRemoteFile } from "./fetch.js";

export async function buildDecoder(watchHtml) {
  if (!watchHtml) {
    return null;
  }

  let jsFileUrlMatches = watchHtml.match(
    /\/s\/player\/[A-Za-z0-9]+\/[A-Za-z0-9_.]+\/[A-Za-z0-9_]+\/base\.js/
  );

  if (!jsFileUrlMatches) {
    return null;
  }

  let jsFileContent = await fetchRemoteFile(
    `https://www.youtube.com${jsFileUrlMatches[0]}`
  );

  let decodeFunctionMatches = jsFileContent.match(
    /function.*\.split\(\"\"\).*\.join\(\"\"\)}/
  );

  if (!decodeFunctionMatches) {
    return null;
  }

  let decodeFunction = decodeFunctionMatches[0];

  let varNameMatches = decodeFunction.match(/\.split\(\"\"\);([a-zA-Z0-9]+)\./);

  if (!varNameMatches) {
    return null;
  }

  let varStartIndex = jsFileContent.indexOf(`var ${varNameMatches[1]}={`);
  if (varStartIndex < 0) {
    return null;
  }
  let varEndIndex = jsFileContent.indexOf("}};", varStartIndex);
  if (varEndIndex < 0) {
    return null;
  }

  let varDeclares = jsFileContent.substring(varStartIndex, varEndIndex + 3);

  if (!varDeclares) {
    return null;
  }

  return function (signatureCipher) {
    let params = new URLSearchParams(signatureCipher);
    let {
      s: signature,
      sp: signatureParam = "signature",
      url,
    } = Object.fromEntries(params);
    let decodedSignature = new Function(`
            "use strict";
            ${varDeclares}
            return (${decodeFunction})("${signature}");
        `)();

    return `${url}&${signatureParam}=${encodeURIComponent(decodedSignature)}`;
  };
}
