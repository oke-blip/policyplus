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

/** Crop a region from `imageSrc` and return a JPEG data URL, optionally downscaled. */
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
  const ctx = canvas.getContext("2d");
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

  return canvas.toDataURL("image/jpeg", quality);
}
