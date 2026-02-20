export function getPlayedSeconds(video: HTMLMediaElement): number {
  let total = 0;
  for (let i = 0; i < video.played.length; i += 1) {
    total += video.played.end(i) - video.played.start(i);
  }
  return total;
}