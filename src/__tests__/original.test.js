import { getVideoId } from "../original.js";

describe(`${getVideoId.name}`, () => {
  test("should provide ID", () => {
    const sampleVideoUrl = "https://www.youtube.com/watch?v=Ca93bp-jpn8";
    const result = getVideoId({ url: sampleVideoUrl });
    expect(result).toMatch("Ca93bp-jpn8");
  });
});
