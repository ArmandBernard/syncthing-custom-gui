export default async function copyToClipboard(text: string) {
  // Note: this only works on localHost and https
  await navigator.clipboard.writeText(text)
}
