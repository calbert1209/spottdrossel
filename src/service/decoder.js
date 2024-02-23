import { fetchRemoteFile } from "./fetch.js";

function captureBaseJsPath(html) {
  const matches = html.match(
    /\/s\/player\/[A-Za-z0-9]+\/[A-Za-z0-9_.]+\/[A-Za-z0-9_]+\/base\.js/
  );

  return matches?.[0] ?? null;
}

function findDecodeFunction(jsContent) {
  const matches = jsContent.match(/function.*\.split\(\"\"\).*\.join\(\"\"\)}/);

  return matches?.[0] ?? null;
}

function findVariableName(jsContent) {
  const matches = jsContent.match(/\.split\(\"\"\);([a-zA-Z0-9]+)\./);
  return matches?.[1] ?? null;
}

function findVariableDeclaration(jsContent, variableName) {
  const startIndex = jsContent.indexOf(`var ${variableName}={`);
  if (startIndex < 0) return null;

  const endIndex = jsContent.indexOf("}};", startIndex);
  if (endIndex < 0) return null;

  return jsContent.substring(startIndex, endIndex + 3) || null;
}

function parseSignatureCipherParams(cipher) {
  const params = new URLSearchParams(cipher);
  const asObject = Object.fromEntries(params);
  return {
    signature: asObject.s,
    signatureParam: asObject.sp ?? "signature",
    url: asObject.url,
  };
}

function decodeUriReadySignature({
  variableDeclaration,
  decodeFnText,
  signature,
}) {
  const decodedSignature = new Function(`
    "use strict";
    ${variableDeclaration}
    return (${decodeFnText})("${signature}");
  `)();
  return encodeURIComponent(decodedSignature);
}

export const testableFunctions = {
  captureBaseJsPath,
  findDecodeFunction,
  findVariableName,
  findVariableDeclaration,
  parseSignatureCipherParams,
  decodeUriReadySignature,
};

export async function buildDecoder(watchHtml) {
  if (!watchHtml) {
    return null;
  }

  const jsFilePath = captureBaseJsPath(watchHtml);
  if (!jsFilePath) {
    return null;
  }

  const jsFileContent = await fetchRemoteFile(
    `https://www.youtube.com${jsFilePath}`
  );

  const decodeFunction = findDecodeFunction(jsFileContent);
  if (decodeFunction === null) {
    return null;
  }

  const variableName = findVariableName(decodeFunction);
  if (!variableName) {
    return null;
  }

  const variableDeclaration = findVariableDeclaration(
    jsFileContent,
    variableName
  );
  if (!variableDeclaration) {
    return null;
  }

  return function (signatureCipher) {
    const { signature, signatureParam, url } =
      parseSignatureCipherParams(signatureCipher);
    const decodedSignature = decodeUriReadySignature({
      variableDeclaration,
      decodeFnText: decodeFunction,
      signature,
    });

    return `${url}&${signatureParam}=${decodedSignature}`;
  };
}
