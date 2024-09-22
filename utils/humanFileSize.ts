const suffixes: Array<string> = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

export const humanFileSize = (bytes: number | string) => {
  const parsedBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!parsedBytes) {
    return "0 Bytes";
  }

  const i = Math.floor(Math.log(parsedBytes) / Math.log(1024));
  return (!parsedBytes && "0 Bytes") || (parsedBytes / Math.pow(1024, i)).toFixed(2) + " " + suffixes[i];
};
