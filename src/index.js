import { getVideoInfo } from "./getVideoInfo.js";

(async function main(argv) {
  if (argv.length < 3) {
    console.log("Invalid Arguments: `node file.js <video_ID>`");
    process.exit(1);
  }

  const url = argv[2];
  try {
    const result = await getVideoInfo(url);
    if (result === null) {
      console.log("Video not found.");
      process.exit(0);
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
})(process.argv);
