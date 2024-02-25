const ID_PATTERN = "([^#&?]{11})";
const COMMON_PATTERNS = [
  // youtu.be/<id>
  `youtu\.be\/${ID_PATTERN}`,
  // ?v=<id>
  `\\?v=${ID_PATTERN}`,
  // &v=<id>
  `\\&v=${ID_PATTERN}`,
  // embed/<id>
  `embed\/${ID_PATTERN}`,
  // /v/<id>
  `\/v\/${ID_PATTERN}`,
].map((exp) => new RegExp(exp));
const TOKEN_AS_ID = new RegExp(`^${ID_PATTERN}$`);
const TOKEN_DELIMITER = /[\/\&\?=#\.\s]/g;

export function parseVideoId(url) {
  for (let pattern of COMMON_PATTERNS) {
    if (pattern.test(url)) {
      return pattern.exec(url)[1];
    }
  }

  const tokens = url.split(TOKEN_DELIMITER);
  const videoId = tokens.find((t) => TOKEN_AS_ID.test(t));
  if (videoId) {
    return videoId;
  }

  throw new Error("Could not parse video ID");
}
