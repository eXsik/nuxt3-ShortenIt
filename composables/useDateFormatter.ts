export function useDateFormatter() {
  function formatDate(timestamp: string, locale: string = "en-GB"): string {
    const date = new Date(timestamp);
    return date.toLocaleString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return { formatDate };
}
