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

export const getVideoInfo = async ({ url, throwOnError = false }) => {
  let videoId = parseVideoId(url);

  try {
    const response = await fetchVideo(videoId);

    const parsedResponse = parsePlayerResponse(response.data);

    const streamingFormats = parsedResponse.streamingData?.formats ?? [];
    const adaptiveFormats = parsedResponse.streamingData?.adaptiveFormats ?? [];

    let formats = [...streamingFormats, ...adaptiveFormats];

    const isEncryptedVideo = formats.some((it) => !!it.signatureCipher);
    if (isEncryptedVideo) {
      const decoder = await safeBuildDecoder(response.data);
      formats = formats.map((it) => {
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

    /* @todo for live content, need to use `m3u8-file-parser`
     * to retrieve m3u8 link from `response.data`
     * @see
     * {@link https://github.com/dangdungcntt/youtube-stream-url/blob/master/src/index.js }
     */

    return {
      videoDetails: parsedResponse.videoDetails || {},
      formats: formats.filter((format) => format.url),
    };
  } catch (e) {
    if (throwOnError) {
      throw e;
    }

    return null;
  }
};
