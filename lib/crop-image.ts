import type { Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

const ALPHA_SOURCE_RE = /^data:image\/(png|webp|gif)/i;

function croppedRegionHasTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 255) return true;
  }
  return false;
}

/** Crop a region from `imageSrc` and return a data URL (PNG if alpha, else JPEG), optionally downscaled. */
export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  outputMaxWidth?: number,
  quality = 0.88,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  let width = pixelCrop.width;
  let height = pixelCrop.height;

  if (outputMaxWidth && width > outputMaxWidth) {
    const scale = outputMaxWidth / width;
    width = outputMaxWidth;
    height = Math.round(pixelCrop.height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  const preserveAlpha =
    ALPHA_SOURCE_RE.test(imageSrc) && croppedRegionHasTransparency(ctx, width, height);
  return preserveAlpha
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", quality);
}
