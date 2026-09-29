// Asia/Dhaka Bangladesh Timezone Utilities (UTC+6)

export function getDhakaDate(date: Date = new Date()): Date {
  const dhakaStr = date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
  return new Date(dhakaStr);
}

export function getDhakaDateString(date: Date = new Date()): string {
  // Returns "YYYY-MM-DD" strictly for Dhaka timezone
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getDhakaTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function getDhakaTimeBn(date: Date = new Date()): string {
  const str = getDhakaTimeString(date);
  const banglaDigits: Record<string, string> = {
    '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'
  };
  const bn = str.replace(/[0-9]/g, m => banglaDigits[m] || m);
  return bn.replace("AM", "সকাল").replace("PM", "বিকাল/রাত");
}

export function formatDhakaTimestamp(isoOrDate: any): string {
  if (!isoOrDate) return "--:--";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return String(isoOrDate);
  return getDhakaTimeString(d);
}
