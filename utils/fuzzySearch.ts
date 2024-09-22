import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";

interface FuzzySearchOptions<T> {
  keys: Array<FuseOptionKey<T>>;
  threshold?: number;
}

export function fuzzySearch<T>(list: T[], searchTerm: string, options: FuzzySearchOptions<T>): T[] {
  if (!searchTerm || searchTerm.trim() === "") {
    return list;
  }

  const fuseOptions: IFuseOptions<T> = {
    keys: options.keys,
    includeScore: true,
    isCaseSensitive: false,
    shouldSort: true,
    threshold: options.threshold || 0.5
  };

  const fuse = new Fuse(list, fuseOptions);
  const result = fuse.search(searchTerm);

  return result.map((item) => item.item);
}
