export function shortenUrl(url: string) {
  return url.replace('http://', '').replace('https://', '')
}
