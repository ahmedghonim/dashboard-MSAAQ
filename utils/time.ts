type HMS = {
  hours: string | number;
  minutes: string | number;
  seconds: string | number;
};

export function HMSToSeconds(time: HMS): number {
  const numHours = typeof time.hours === "string" ? Number(time.hours) : time.hours;
  const numMinutes = typeof time.minutes === "string" ? Number(time.minutes) : time.minutes;
  const numSeconds = typeof time.seconds === "string" ? Number(time.seconds) : time.seconds;

  const hoursInSeconds = numHours * 3600;
  const minutesInSeconds = numMinutes * 60;
  return hoursInSeconds + minutesInSeconds + numSeconds;
}

export function secondsToHMS(seconds: string | number): HMS {
  const numSeconds = typeof seconds === "string" ? Number(seconds) : seconds;

  const hours = numSeconds / 3600;
  const minutes = (numSeconds % 3600) / 60;
  const remainingSeconds = numSeconds % 60;

  return {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
    seconds: Math.floor(remainingSeconds)
  };
}

export const msToHMS = (milliseconds: number): HMS => {
  const seconds = milliseconds / 1000;
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  const remainingSeconds = seconds % 60;
  return {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
    seconds: Math.floor(remainingSeconds)
  };
};
export const hmsToMs = (hours: number, minutes: number, seconds: number): number =>
  (hours * 60 * 60 + minutes * 60 + seconds) * 1000;

export const secondsToMinutes = (seconds: number): number => seconds / 60;
export const minutesToSeconds = (minutes: number): number => minutes * 60;
