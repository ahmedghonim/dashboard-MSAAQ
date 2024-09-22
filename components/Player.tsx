import { FC, useRef } from "react";

import {
  MediaPlayer,
  MediaPlayerInstance,
  type MediaPlayerProps,
  MediaProvider,
  TimeSlider,
  TimeSliderInstance,
  useStore
} from "@vidstack/react";
import { DefaultAudioLayout, DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";

interface VideoPlayerProps extends Omit<MediaPlayerProps, "children"> {
  hasFullscreenButton?: boolean;
}

const Player: FC<VideoPlayerProps> = ({ src, title, loop = false, ...reset }) => {
  const player = useRef<MediaPlayerInstance>(null);

  const timeSliderRef = useRef<TimeSliderInstance>(null),
    {} = useStore(TimeSliderInstance, timeSliderRef);

  const ARABIC = {
    Audio: "الصوت",
    Auto: "تلقائي",
    Continue: "استكمال",
    Default: "",
    "Enter Fullscreen": "وضع الشاشة الكاملة",
    "Exit Fullscreen": "الخروج من الشاشة الكاملة",
    LIVE: "بث حي",
    Mute: "كتم الصوت",
    Normal: "طبيعي",
    Off: "إيقاف",
    Pause: "إيقاف",
    Play: "تشغيل",
    Quality: "الجودة",
    Replay: "إعادة تشغيل",
    Reset: "إعادة تعيين",
    Seek: "بحث",
    Settings: "الإعدادات",
    "Seek Backward": "",
    "Seek Forward": "",
    "Skip To Live": "",
    Speed: "السرعة",
    Unmute: "إلغاء كتم الصوت",
    Volume: "الصوت",
    Connected: "متصل",
    Connecting: "جار الاتصال",
    Disconnected: "غير متصل",
    Fullscreen: "شاشة كاملة"
  };

  return (
    <MediaPlayer
      title={title}
      src={src}
      ref={player}
      loop={loop}
      {...reset}
      playsInline
      className="video-player-wrapper direction-ltr"
    >
      <MediaProvider className="video-player" />
      <DefaultVideoLayout
        translations={ARABIC}
        icons={defaultLayoutIcons}
        slots={{
          pipButton: null,
          googleCastButton: null
        }}
      />
    </MediaPlayer>
  );
};

export default Player;
