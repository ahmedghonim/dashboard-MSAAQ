export class CacheHandler {
  protected cache: { [key: string]: { value: any; expiry: number } };

  constructor() {
    this.cache = {};
  }

  /**
   * The setCache() method takes in a key, value, and expiry time in seconds,
   * and stores the value in the cache object along with a timestamp of when it should expire.
   *
   * @param key
   * @param value
   * @param expirySeconds
   */
  setCache(key: string, value: any, expirySeconds: number): void {
    this.cache[key] = {
      value,
      expiry: new Date().getTime() + expirySeconds * 1000
    };
  }

  /**
   * The getCache() method takes in a key and checks whether the value exists in the cache and whether it has expired or not.
   * If the value exists and has not expired, it returns the value, otherwise it returns null.
   *
   * @param key
   */
  getCache(key: string): any | null {
    const item = this.cache[key];
    if (item && new Date().getTime() < item.expiry) {
      return item.value;
    }
    return null;
  }

  /**
   * The clearCache() method removes a key and its corresponding value from the cache.
   *
   * @param key
   */
  clearCache(key: string): void {
    delete this.cache[key];
  }
}
