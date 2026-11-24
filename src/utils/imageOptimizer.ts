/**
 * Sentinel AI - Client-Side Image Optimizer
 * 
 * Resizes high-resolution photographs to a maximum dimension (default 1280px)
 * and converts to JPEG at ~85% quality to minimize upload bandwidth and
 * prevent memory paging/swapping on cloud container runtimes.
 * 
 * Guarantees:
 * - Aspect ratio is strictly preserved.
 * - Smaller images are never upscaled.
 * - EXIF orientation is preserved.
 * - Graceful fallback to original image on any processing error.
 */

export interface ImageOptimizationMeta {
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  originalSizeFormatted: string;
  optimizedSizeFormatted: string;
  compressionRatioPct: number;
  durationMs: number;
  wasResized: boolean;
  mimeType: string;
}

export interface ImageOptimizationResult {
  file: File;
  meta: ImageOptimizationMeta;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export async function optimizeImageForInference(
  file: File,
  maxDimension: number = 1280,
  quality: number = 0.85
): Promise<ImageOptimizationResult> {
  const startTime = performance.now();
  const originalSizeBytes = file.size;

  try {
    let imgBitmap: ImageBitmap | null = null;
    let width = 0;
    let height = 0;

    // 1. Load image and extract natural dimensions, respecting orientation
    if (typeof createImageBitmap === "function") {
      try {
        imgBitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        width = imgBitmap.width;
        height = imgBitmap.height;
      } catch {
        imgBitmap = null;
      }
    }

    let imgElement: HTMLImageElement | null = null;
    if (!imgBitmap) {
      imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(objectUrl);
          reject(e);
        };
        img.src = objectUrl;
      });
      width = imgElement.naturalWidth || imgElement.width;
      height = imgElement.naturalHeight || imgElement.height;
    }

    if (width <= 0 || height <= 0) {
      throw new Error(`Invalid image dimensions detected: ${width}x${height}`);
    }

    // 2. Compute constrained dimensions without upscaling
    let targetWidth = width;
    let targetHeight = height;
    let wasResized = false;

    if (width > maxDimension || height > maxDimension) {
      wasResized = true;
      if (width >= height) {
        targetWidth = maxDimension;
        targetHeight = Math.round((height * maxDimension) / width);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((width * maxDimension) / height);
      }
    }

    // 3. Render onto Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    if (!ctx) {
      throw new Error("Could not acquire 2D canvas rendering context.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (imgBitmap) {
      ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);
      imgBitmap.close();
    } else if (imgElement) {
      ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);
    }

    // 4. Encode to JPEG at 85% quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas conversion to Blob returned null."));
        },
        "image/jpeg",
        quality
      );
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);
    const optimizedSizeBytes = blob.size;
    const compressionRatioPct =
      originalSizeBytes > 0
        ? Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100)
        : 0;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const optimizedFile = new File([blob], `${baseName}_optimized.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    const meta: ImageOptimizationMeta = {
      originalWidth: width,
      originalHeight: height,
      optimizedWidth: targetWidth,
      optimizedHeight: targetHeight,
      originalSizeBytes,
      optimizedSizeBytes,
      originalSizeFormatted: formatBytes(originalSizeBytes),
      optimizedSizeFormatted: formatBytes(optimizedSizeBytes),
      compressionRatioPct,
      durationMs,
      wasResized,
      mimeType: "image/jpeg",
    };

    console.info(
      `[Sentinel AI Image Optimizer] ` +
      `Original: ${width}x${height} (${meta.originalSizeFormatted}) -> ` +
      `Optimized: ${targetWidth}x${targetHeight} (${meta.optimizedSizeFormatted}) ` +
      `in ${durationMs}ms (${compressionRatioPct >= 0 ? `-${compressionRatioPct}%` : `+${Math.abs(compressionRatioPct)}%`})`
    );

    return { file: optimizedFile, meta };
  } catch (error) {
    console.warn(
      "[Sentinel AI Image Optimizer] Client-side optimization failed; falling back to original image:",
      error
    );
    const durationMs = Math.round(performance.now() - startTime);
    return {
      file,
      meta: {
        originalWidth: 0,
        originalHeight: 0,
        optimizedWidth: 0,
        optimizedHeight: 0,
        originalSizeBytes,
        optimizedSizeBytes: originalSizeBytes,
        originalSizeFormatted: formatBytes(originalSizeBytes),
        optimizedSizeFormatted: formatBytes(originalSizeBytes),
        compressionRatioPct: 0,
        durationMs,
        wasResized: false,
        mimeType: file.type || "unknown",
      },
    };
  }
}
