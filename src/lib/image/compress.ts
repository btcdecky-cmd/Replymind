const MAX_EDGE = 1280;
const QUALITY = 0.82;
const TARGET_BYTES = 420_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be opened. Try a JPG or PNG screenshot."));
    };
    img.src = url;
  });
}

export async function compressScreenshot(file: File): Promise<string> {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error("Use a JPG, PNG, WEBP, or HEIC screenshot.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("That screenshot is too large. Try a tighter crop.");
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch (err) {
    if (/\.heic$/i.test(file.name) || file.type === "image/heic") {
      throw new Error("This device can't preview HEIC. Convert it to JPG, or take a PNG screenshot.");
    }
    throw err;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > TARGET_BYTES * 1.37 && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}
