export class StringHelper {
  /**
   * The @is method determines if a given string matches a given pattern. Asterisks may be used as wildcard values
   *
   * @param patterns
   * @param strings
   */
  static is(patterns: string | string[], strings: string | string[]): boolean {
    if (!Array.isArray(patterns)) {
      patterns = [patterns];
    }

    if (!Array.isArray(strings)) {
      strings = [strings];
    }

    const regexes = patterns.map(
      (pattern: string) => new RegExp(`^${pattern.split("*").map(escapeRegExp).join(".*")}$`, "i")
    );

    return strings.reduce((acc: boolean, str: string) => {
      return acc || regexes.some((regex) => regex.test(str));
    }, false);
  }

  static limit(str: string, maxLength: number, suffix = "..."): string {
    if (str.length <= maxLength) {
      return str;
    }

    return str.substring(0, maxLength) + suffix;
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
