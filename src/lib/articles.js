export function sortArticlesByDate(articles) {
  return [...articles].sort(
    (first, second) =>
      second.data.publishedAt.getTime() - first.data.publishedAt.getTime() ||
      first.data.title.localeCompare(second.data.title),
  );
}

export function formatArticleDate(date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
