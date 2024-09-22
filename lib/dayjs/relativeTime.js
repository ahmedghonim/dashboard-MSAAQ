export default (o, c, d) => {
  const proto = c.prototype;
  d.en.relativeTime = {
    future: "in %s",
    past: "%s ago",
    s: "seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  };
  const fromTo = (input, withoutSuffix, instance, isFrom) => {
    const loc = instance.$locale().relativeTime;
    const T = [
      { l: "s", r: 59, d: "second" },
      { l: "m", r: 59 },
      { l: "mm", r: 59, d: "minute" },
      { l: "h", r: 23 },
      { l: "hh", r: 23, d: "hour" },
      { l: "d", r: 29 },
      { l: "dd", r: 29, d: "day" },
      { l: "M", r: 12 },
      { l: "MM", r: 12, d: "month" },
      { l: "y" },
      { l: "yy", d: "year" }
    ];
    const Tl = T.length;
    let result;
    let out;

    for (let i = 0; i < Tl; i += 2) {
      let t = T[i];

      if (t.d) {
        result = isFrom ? d(input).diff(instance, t.d, true) : instance.diff(input, t.d, true);
      }

      const abs = Math.round(Math.abs(result));

      if (abs <= t.r || !t.r) {
        if (abs === 1 && i > 0) {
          t = T[i - 1];
        }

        out = ("specialNumeration" in loc ? loc.specialNumeration(t.l, abs) : loc[t.l]).replace("%d", abs);

        break;
      }
    }
    if (withoutSuffix) return out;
    return (result > 0 ? loc.future : loc.past).replace("%s", out);
  };
  proto.to = function (input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this, true);
  };
  proto.from = function (input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this);
  };

  const makeNow = (thisDay) => (thisDay.$u ? d.utc() : d());

  proto.toNow = function (withoutSuffix) {
    return this.to(makeNow(this), withoutSuffix);
  };
  proto.fromNow = function (withoutSuffix) {
    return this.from(makeNow(this), withoutSuffix);
  };
};
