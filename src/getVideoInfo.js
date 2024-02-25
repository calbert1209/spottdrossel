import { fetchVideo } from "./service/fetch.js";
import { buildDecoder } from "./service/decoder.js";
import { parseVideoId } from "./service/parseVideoId.js";

function parsePlayerResponse(html) {
  const matches = html.match(/ytInitialPlayerResponse = (.*)}}};/);
  if (!matches?.[1]) {
    throw new Error("Could not parse player response");
  }
  const jsonData = `${matches[1]}\}\}\}`;
  return JSON.parse(jsonData);
}

async function safeBuildDecoder(responseData) {
  try {
    return await buildDecoder(responseData);
  } catch (error) {
    console.debug("Could not build decoder:\n", error);
  }

  return null;
}

async function decodeUrls(formats, responseData) {
  const decoder = await safeBuildDecoder(responseData);
  return formats.map((it) => {
    if (it.url || !it.signatureCipher) {
      return it;
    }

    if (decoder) {
      it.url = decoder(it.signatureCipher);
      delete it.signatureCipher;
    }

    return it;
  });
}

export const getVideoInfo = async (url) => {
  let videoId = parseVideoId(url);
  const response = await fetchVideo(videoId);
  const parsedResponse = parsePlayerResponse(response);

  const streamingFormats = parsedResponse.streamingData?.formats ?? [];
  const adaptiveFormats = parsedResponse.streamingData?.adaptiveFormats ?? [];

  let formats = [...streamingFormats, ...adaptiveFormats];

  const isEncryptedVideo = formats.some((it) => !!it.signatureCipher);
  if (isEncryptedVideo) {
    formats = await decodeUrls(formats, response);
  }

  /* @todo for live content, need to use `m3u8-file-parser`
   * to retrieve m3u8 link from `response.data`
   * @see
   * {@link https://github.com/dangdungcntt/youtube-stream-url/blob/master/src/index.js }
   */

  return {
    videoDetails: parsedResponse.videoDetails || {},
    formats: formats.filter((format) => format.url),
  };
};
