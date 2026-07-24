// components/image-compress.js — WebP encoding with JPEG fallback.
// Safari's canvas has no WebP encoder: toDataURL('image/webp', q) silently
// returns an uncompressed PNG instead (spec-mandated fallback), which is far
// larger than the original. Detect that and re-encode as JPEG in that case.

export function canvasToCompressedURL(canvas, quality, jpegQuality = quality) {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/jpeg', jpegQuality);
}

// Logo may have transparency — fall back to PNG (not JPEG) when WebP fails.
export function canvasToCompressedURLWithAlpha(canvas, quality) {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/png');
}
