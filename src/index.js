import { getInfo } from "./original.js";

const sampleVideoUrl = "https://www.youtube.com/watch?v=Ca93bp-jpn8";

(async function main() {
  const result = await getInfo({ url: sampleVideoUrl });
  console.log(JSON.stringify(result, null, 2));
})();
