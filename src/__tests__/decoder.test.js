import baseFileContents from "./sample-base.js?raw";
import samplePage from "./sample-page.html?raw";
import { testableFunctions as functions } from "../service/decoder";

describe(`${functions.captureBaseJsPath.name}`, () => {
  test("should get path from url", () => {
    const match = functions.captureBaseJsPath(samplePage);
    expect(match).toMatch("/s/player/3ffefd71/player_ias.vflset/ja_JP/base.js");
  });
});

describe(`${functions.findDecodeFunction.name}`, () => {
  test("should find decode function in JS contents", () => {
    const match = functions.findDecodeFunction(baseFileContents);
    expect(match).toMatch(
      'function(a){a=a.split("");zP.W3(a,3);zP.VT(a,40);zP.ws(a,36);zP.W3(a,3);zP.VT(a,32);zP.W3(a,2);zP.ws(a,46);'
    );
  });
});

describe(`${functions.findVariableName.name}`, () => {
  test("should find decode function variable name", () => {
    const match = functions.findVariableName(baseFileContents);
    expect(match).toMatch("zP");
  });
});
