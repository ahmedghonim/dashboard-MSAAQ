import dayjs from "dayjs";

const months = "يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_");

const locale = {
  name: "ar",
  weekdays: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
  weekdaysShort: "أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت".split("_"),
  weekdaysMin: "ح_ن_ث_ر_خ_ج_س".split("_"),
  months,
  monthsShort: months,
  weekStart: 6,
  relativeTime: {
    future: "بعد %s",
    past: "منذ %s",
    specialNumeration: (l, n) => {
      const y = l.substring(0, 1);
      const str = {
        s: ["ثوان", "ثانية", "ثانيتين", "ثوان"],
        m: ["دقيقة واحدة", "دقيقة", "دقيقتين", "دقائق"],
        h: ["ساعة واحدة", "ساعة", "ساعتين", "ساعات"],
        d: ["يوم واحد", "يوم", "يومين", "أيام"],
        w: ["أسبوع واحد", "أسبوع", "أسبوعين", "أسابيع"],
        M: ["شهر واحد", "شهر", "شهرين", "أشهر"],
        y: ["عام واحد", "عام", "عامين", "أعوام"]
      };

      const x = Number(String(n).substr(-2, 2));

      if (n < 2) {
        return `${str[y][0]} `;
      }

      if (x < 2) {
        return `%d ${str[y][1]}`;
      }

      if (x > 2) {
        if (n < 11) {
          return `%d ${str[y][3]}`;
        }
        return `%d ${str[y][1]}`;
      }

      if (n === 2) {
        return str[y][2];
      }

      return `%d و ${str[y][3]}`;
    }
  },
  ordinal: (n) => n,
  formats: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "D/‏M/‏YYYY",
    LL: "D MMMM YYYY",
    LLL: "D MMMM YYYY HH:mm",
    LLLL: "dddd D MMMM YYYY HH:mm"
  }
};

dayjs.locale(locale, null, true);

export default locale;
