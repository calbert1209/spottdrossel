import { parseVideoId } from "../service/parseVideoId.js";

describe(`${parseVideoId.name}`, () => {
  test("should provide ID", () => {
    const sampleVideoUrl = "https://www.youtube.com/watch?v=Ca93bp-jpn8";
    const result = parseVideoId(sampleVideoUrl);
    expect(result).toMatch("Ca93bp-jpn8");
  });
});
