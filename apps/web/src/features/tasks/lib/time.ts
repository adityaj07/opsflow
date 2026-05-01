export const toRelativeTime = (isoDate: string): string => {
  const targetTime = new Date(isoDate).getTime();
  const now = Date.now();
  const diffSeconds = Math.round((targetTime - now) / 1000);

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === "second") {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }

  return "just now";
};
