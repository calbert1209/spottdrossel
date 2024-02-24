import { fetchRemoteFile } from "./fetch.js";

function captureBaseJsPath(html) {
  const matches = html.match(
    /\/s\/player\/[A-Za-z0-9]+\/[A-Za-z0-9_.]+\/[A-Za-z0-9_]+\/base\.js/
  );

  if (!matches?.[0]) {
    throw new Error("Could not capture base JS file path");
  }

  return matches[0];
}

function findDecodeFunction(jsContent) {
  const matches = jsContent.match(/function.*\.split\(\"\"\).*\.join\(\"\"\)}/);
  if (!matches?.[0]) {
    throw new Error("Could not find decode function");
  }

  return matches[0];
}

function findVariableName(jsContent) {
  const matches = jsContent.match(/\.split\(\"\"\);([a-zA-Z0-9]+)\./);
  if (!matches?.[1]) {
    throw new Error("Could not find decode function variable name");
  }

  return matches[1];
}

function findVariableDeclaration(jsContent, variableName) {
  const startIndex = jsContent.indexOf(`var ${variableName}={`);
  if (startIndex < 0) {
    throw new Error("Could not find start of variable declaration");
  }

  const endIndex = jsContent.indexOf("}};", startIndex);
  if (endIndex < 0) {
    throw new Error("Could not find end of variable declaration");
  }

  const declaration = jsContent.substring(startIndex, endIndex + 3);
  if (!declaration) {
    throw new Error("Could not find variable declaration");
  }

  return declaration;
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
  const jsFilePath = captureBaseJsPath(watchHtml);
  const jsFileContent = await fetchRemoteFile(jsFilePath);

  const decodeFunction = findDecodeFunction(jsFileContent);
  const variableName = findVariableName(decodeFunction);
  const variableDeclaration = findVariableDeclaration(
    jsFileContent,
    variableName
  );

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
