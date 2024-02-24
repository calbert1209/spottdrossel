import { fetchVideo } from "./service/fetch.js";
import { buildDecoder } from "./service/decoder.js";
import { parseVideoId } from "./service/parseVideoId.js";

function parsePlayerResponse(html) {
  const matches = html.match(/ytInitialPlayerResponse = (.*)}}};/);
  if (!matches?.[1]) {
    return null;
  }
  const jsonData = `${matches[1]}\}\}\}`;
  return JSON.parse(jsonData);
}

export const getInfo = async ({ url, throwOnError = false }) => {
  let videoId = parseVideoId(url);
  if (!videoId) return null;

  try {
    const response = await fetchVideo(videoId);
    if (!response.data) {
      return null;
    }

    const parsedResponse = parsePlayerResponse(response.data);
    if (!parsedResponse) {
      return null;
    }

    const streamingFormats = parsedResponse.streamingData?.formats ?? [];
    const adaptiveFormats = parsedResponse.streamingData?.adaptiveFormats ?? [];

    let formats = [...streamingFormats, ...adaptiveFormats];

    const isEncryptedVideo = formats.some((it) => !!it.signatureCipher);
    if (isEncryptedVideo) {
      let decoder = await buildDecoder(response.data);

      if (decoder) {
        formats = formats.map((it) => {
          if (it.url || !it.signatureCipher) {
            return it;
          }

          it.url = decoder(it.signatureCipher);
          delete it.signatureCipher;
          return it;
        });
      }
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
