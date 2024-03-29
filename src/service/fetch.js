/**
 * Fetch a remote JS file
 * @param {string} url
 * @returns Promise<any | null> promise resolves null when fetch fails
 * @throws when fetch fails or fetched response body text cannot be retrieved
 */
export async function fetchRemoteFile(fileName) {
  const url = `https://www.youtube.com${fileName}`;
  try {
    let response = await globalThis.fetch(url);
    return response.text();
  } catch (e) {
    console.debug("Could not fetch remote JS file:\n", e);
    throw e;
  }
}

/**
 * fetch video from YouTube
 * @param {string} videoId
 * @returns string html of video page
 * @throws when fetch fails or response cannot be retrieved
 */
export async function fetchVideo(videoId) {
  const ytApi = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await globalThis.fetch(ytApi);

  if (!response || response.status != 200) {
    const error = new Error("Could not get youtube video response");
    error.response = response;
    throw error;
  }

  return response.text();
}
