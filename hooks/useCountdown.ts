import { useCallback, useEffect, useState } from "react";

type CountdownHook = {
  currentTime: number;
  currentTimeFormatted: string;
  isStarted: boolean;
  isEnded: boolean;
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
  setCountdown: (seconds: number) => void;
};

const useCountdown = (initialSeconds: number, onStart?: () => void, onEnd?: () => void): CountdownHook => {
  const [currentTime, setCurrentTime] = useState(initialSeconds);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const setCountdown = useCallback((seconds: number) => {
    setCurrentTime(seconds);
  }, []);

  const startCountdown = useCallback(() => {
    setIsStarted(true);
    onStart && onStart();
  }, [onStart]);

  const endCountdown = useCallback(() => {
    setIsEnded(true);
    onEnd && onEnd();
  }, [onEnd]);

  const stopCountdown = useCallback(() => {
    setIsStarted(false);
  }, []);

  const resetCountdown = useCallback(() => {
    setCurrentTime(initialSeconds);
    setIsStarted(false);
    setIsEnded(false);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isStarted && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((time) => time - 1);
      }, 1000);
    } else if (!isEnded && isStarted && currentTime === 0) {
      endCountdown();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentTime, isStarted, onEnd]);

  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;

  const currentTimeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    currentTime,
    currentTimeFormatted,
    isStarted,
    isEnded,
    setCountdown,
    startCountdown,
    stopCountdown,
    resetCountdown
  };
};

export default useCountdown;
