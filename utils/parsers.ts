export function parseDuration(durationInSeconds: number | string): string {
  const parsedDuration = typeof durationInSeconds === "string" ? parseInt(durationInSeconds) : durationInSeconds;
  if (!parsedDuration) {
    return "00:00";
  }

  let hours: string | number = Math.floor(parsedDuration / 3600);
  let minutes: string | number = Math.floor((parsedDuration - hours * 3600) / 60);
  let seconds: string | number = parsedDuration - hours * 3600 - minutes * 60;

  if (hours) {
    hours = `${hours}`.padStart(2, "0");
  }

  seconds = `${seconds}`.padStart(2, "0");
  minutes = `${minutes}`.padStart(2, "0");

  return `${hours ? `${hours}:` : ""}${minutes ? `${minutes}:` : ""}${seconds}`;
}
