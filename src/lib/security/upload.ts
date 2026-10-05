export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_STORED_BYTES = 700_000;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAGIC: Array<{ mime: string; test: (b: Uint8Array) => boolean }> = [
  { mime: "image/jpeg", test: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 },
  { mime: "image/png", test: (b) => b.length > 7 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/webp", test: (b) => b.length > 11 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 },
];

export type UploadValidation =
  | { ok: true; mime: string; bytes: Uint8Array; base64: string }
  | { ok: false; error: string };

function decodeDataUrl(dataUrl: string): { mime: string; base64: string } | null {
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl.trim());
  if (!match) return null;
  return { mime: match[1].toLowerCase(), base64: match[2].replace(/\s/g, "") };
}

function fromBase64(b64: string): Uint8Array | null {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function sniffMime(bytes: Uint8Array, claimed: string) {
  for (const m of MAGIC) {
    if (m.test(bytes)) return m.mime === "image/jpeg" && claimed === "image/jpg" ? "image/jpeg" : m.mime;
  }
  if (claimed === "image/heic" || claimed === "image/heif") return claimed;
  return null;
}

export function validateImageDataUrl(dataUrl: string): UploadValidation {
  if (!dataUrl || typeof dataUrl !== "string") {
    return { ok: false, error: "No image was provided." };
  }
  if (dataUrl.length > MAX_UPLOAD_BYTES * 1.4) {
    return { ok: false, error: "That screenshot is too large. Try a tighter crop." };
  }
  const parsed = decodeDataUrl(dataUrl);
  if (!parsed) {
    return { ok: false, error: "That file does not look like an image." };
  }
  if (!ALLOWED_MIME.has(parsed.mime)) {
    return { ok: false, error: "Use a JPG, PNG, WEBP, or HEIC screenshot." };
  }
  const bytes = fromBase64(parsed.base64);
  if (!bytes) {
    return { ok: false, error: "That image could not be read." };
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That screenshot is too large. Try a tighter crop." };
  }
  if (bytes.byteLength < 32) {
    return { ok: false, error: "That image is empty or damaged." };
  }
  const mime = sniffMime(bytes, parsed.mime);
  if (!mime) {
    return { ok: false, error: "That file is not a supported screenshot format." };
  }
  return { ok: true, mime, bytes, base64: parsed.base64 };
}

export function isAllowedMime(mime: string) {
  return ALLOWED_MIME.has(mime.toLowerCase());
}
