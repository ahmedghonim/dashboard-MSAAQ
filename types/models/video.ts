export enum VideoStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  READY = "ready",
  FAILED = "failed"
}

export type Video = {
  id: number;
  academy_id: number;
  created_by: number;
  title: string;
  source: "upload" | "url";
  provider: "bunny" | "stream" | "youtube" | "vimeo";
  size: string;
  status: VideoStatus;
  is_hls: boolean;
  url: string;
  download_url?: string;
  thumbnail: string | null;
  duration: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  stream_info: {
    stream_url: string;
    stream_headers: {
      [key: string]: string;
    };
  };
};
