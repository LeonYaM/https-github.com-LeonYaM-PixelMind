/**
 * Utility to download media files with format conversion (PNG, JPG, WEBP)
 * and cross-origin blob handling.
 */
export async function downloadMedia(url: string, baseFilename: string, format?: 'png' | 'jpg' | 'webp' | 'mp4'): Promise<void> {
  try {
    // If it's a video or non-image format, download directly as blob
    if (format === 'mp4' || url.endsWith('.mp4') || url.endsWith('.webm')) {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${baseFilename}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    }

    // For images, load into an offscreen image and draw to canvas to ensure true format conversion
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        // Fallback if cross-origin fails on Image element
        resolve();
      };
      img.src = url;
    });

    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const ext = format || 'png';

        canvas.toBlob((blob) => {
          if (!blob) {
            triggerDirectDownload(url, `${baseFilename}.${ext}`);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${baseFilename}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }, mimeType, 0.95);
        return;
      }
    }

    // Fallback direct blob download
    triggerDirectDownload(url, `${baseFilename}.${format || 'png'}`);
  } catch (err) {
    console.warn('Canvas conversion failed, triggering direct download:', err);
    triggerDirectDownload(url, `${baseFilename}.${format || 'png'}`);
  }
}

function triggerDirectDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
