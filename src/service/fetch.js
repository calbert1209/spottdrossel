import axios from "axios";

/**
 * Fetch a remote file
 * @param {string} url
 * @returns Promise<any | null> promise resolves null when fetch fails
 */
export async function fetchRemoteFile(url) {
  try {
    let { data } = await axios.get(url);
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * fetch video from YouTube
 * @param {string} videoId
 * @returns AxiosResponse<any, any>
 */
export async function fetchVideo(videoId) {
  const ytApi = "https://www.youtube.com/watch";

  const response = await axios.get(ytApi, {
    params: { v: videoId },
  });

  if (!response || response.status != 200 || !response.data) {
    const error = new Error("Cannot get youtube video response");
    error.response = response;
    throw error;
  }

  return response;
}
