export function convertGoogleDriveUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
  }
  return trimmed;
}