import { fetchVideo } from "./service/fetch.js";
import { buildDecoder } from "./service/decoder.js";
import { parseVideoId } from "./service/parseVideoId.js";

const resolvePlayerResponse = (html) => {
  if (!html) {
    return "";
  }

  let matches = html.match(/ytInitialPlayerResponse = (.*)}}};/);
  return matches ? matches[1] + "}}}" : "";
};

export const getInfo = async ({ url, throwOnError = false }) => {
  let videoId = parseVideoId(url);
  if (!videoId) return null;

  try {
    const response = await fetchVideo(videoId);

    let ytInitialPlayerResponse = resolvePlayerResponse(response.data);
    let parsedResponse = JSON.parse(ytInitialPlayerResponse);
    let streamingData = parsedResponse.streamingData || {};

    let formats = (streamingData.formats || []).concat(
      streamingData.adaptiveFormats || []
    );

    let isEncryptedVideo = formats.some((it) => !!it.signatureCipher);

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

    let result = {
      videoDetails: parsedResponse.videoDetails || {},
      formats: formats.filter((format) => format.url),
    };

    /* @todo for live content, need to use `m3u8-file-parser`
     * to retrieve m3u8 link from `response.data`
     * @see
     * {@link https://github.com/dangdungcntt/youtube-stream-url/blob/master/src/index.js }
     */

    return result;
  } catch (e) {
    if (throwOnError) {
      throw e;
    }

    return null;
  }
};
