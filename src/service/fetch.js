/**
 * Fetch a remote JS file
 * @param {string} url
 * @returns Promise<any | null> promise resolves null when fetch fails
 */
export async function fetchRemoteFile(fileName) {
  const url = `https://www.youtube.com${fileName}`;
  try {
    let { data } = await globalThis.agnosticFetch(url);
    return data;
  } catch (e) {
    console.debug("Could not fetch remote JS file:\n", e);
    throw e;
  }
}

/**
 * fetch video from YouTube
 * @param {string} videoId
 * @returns AxiosResponse<any, any>
 */
export async function fetchVideo(videoId) {
  const ytApi = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await globalThis.agnosticFetch(ytApi);

  if (!response || response.status != 200 || !response.data) {
    const error = new Error("Could not get youtube video response");
    error.response = response;
    throw error;
  }

  return response;
}
