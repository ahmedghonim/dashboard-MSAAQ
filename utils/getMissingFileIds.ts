import { Media } from "@/types";

import { SingleFile } from "@msaaqcom/abjad";

export const getMissingFileIds = (
  original: Media | Media[],
  source: SingleFile | SingleFile[] | undefined
): number | number[] => {
  const originalArray = Array.isArray(original) ? original : [original];
  const sourceArray = Array.isArray(source) ? source : [source];

  const originalIds = originalArray.map((file) => file?.id);
  const sourceIds = sourceArray.map((file) => file?.id);

  return originalIds.filter((id) => !sourceIds.includes(id));
};
