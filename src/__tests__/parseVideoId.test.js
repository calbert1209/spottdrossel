import { parseVideoId } from "../service/parseVideoId";

describe(`${parseVideoId.name}`, () => {
  describe("should find video ID when present", () => {
    const cases = [
      {
        memo: "youtu.be/:video_id",
        url: "https://youtu.be/RPa3_AD1_Vs?si=Sf5wNZWYYCGcv6Gd",
        videoId: "RPa3_AD1_Vs",
      },
      {
        memo: "www.youtube.com/watch?v=:video_id",
        url: "https://www.youtube.com/watch?v=RPa3_AD1_Vs",
        videoId: "RPa3_AD1_Vs",
      },
      {
        memo: "www.youtube.com/watch?list=playlist_id&v=:video_id",
        url: "https://www.youtube.com/watch?list=OLAK5uy_nO8nW23t64lmVU3tsx2mhBAGpCC1-03HEv&=VUI-ELCdjxo",
        videoId: "VUI-ELCdjxo",
      },
      {
        memo: "www.youtube.com/embed/:video_id",
        url: "https://www.youtube.com/embed/VUI-ELCdjxo?si=a3TpphB8NsBLJNxF",
        videoId: "VUI-ELCdjxo",
      },
      {
        memo: "www.youtube.com/v/:video_id",
        url: "https://www.youtube.com/v/VUI-ELCdjxo",
        videoId: "VUI-ELCdjxo",
      },
    ];

    test.each(cases)("$memo", ({ url, videoId }) => {
      const foundId = parseVideoId(url);
      expect(foundId).toMatch(videoId);
      expect(foundId.length).toEqual(11);
    });
  });
});
