import { getInfo } from "./original.js";

const longVideoUrl = "https://www.youtube.com/watch?v=Ca93bp-jpn8";
const sampleVideoUrl = "https://youtu.be/Fo-z9lYJn8c?si=4Pmj3uR4txgH7eXo";

(async function main() {
  const result = await getInfo({ url: sampleVideoUrl });
  console.log(JSON.stringify(result, null, 2));
})();
