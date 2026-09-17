export const MAX_IMAGES = 10;
export const MAX_VIDEOS = 2;
export const MAX_VIDEO_SECONDS = 30;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_TOTAL_MEDIA = MAX_IMAGES + MAX_VIDEOS;

const VALID_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VALID_VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
const VALID_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VALID_VIDEO_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export function getImageExtension(buf: ArrayBuffer | Uint8Array): string | null {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  if (bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (bytes.length > 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return ".png";
  if (bytes.length > 12 && toString(bytes, 0, 4) === "RIFF" && toString(bytes, 8, 12) === "WEBP") return ".webp";
  return null;
}

export function getVideoExtension(buf: ArrayBuffer | Uint8Array): string | null {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  if (bytes.length > 8 && toString(bytes, 4, 8) === "ftyp") return ".mp4";
  if (bytes.length > 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return ".webm";
  return null;
}

function toString(bytes: Uint8Array, start: number, end: number): string {
  return bytes.slice(start, end).reduce((acc, b) => acc + String.fromCharCode(b), "");
}

export function isAllowedImageMime(mime: string): boolean {
  return VALID_IMAGE_MIMES.has(mime);
}

export function isAllowedVideoMime(mime: string): boolean {
  return VALID_VIDEO_MIMES.has(mime);
}

export function isAllowedImageExt(ext: string): boolean {
  return VALID_IMAGE_EXTENSIONS.has(ext.toLowerCase());
}

export function isAllowedVideoExt(ext: string): boolean {
  return VALID_VIDEO_EXTENSIONS.has(ext.toLowerCase());
}

export function getVideoDurationSec(buf: ArrayBuffer | Uint8Array): number | null {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  const mp4 = parseMp4Duration(bytes);
  if (mp4 !== null) return mp4;
  return parseWebmDuration(bytes);
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}

function readU64(bytes: Uint8Array, offset: number): number {
  const hi = readU32(bytes, offset);
  const lo = readU32(bytes, offset + 4);
  return hi * 0x100000000 + lo;
}

function parseMp4Duration(bytes: Uint8Array): number | null {
  return findBoxDuration(bytes, 0, bytes.length);
}

function findBoxDuration(bytes: Uint8Array, start: number, end: number): number | null {
  let offset = start;
  while (offset + 8 <= end) {
    let boxSize = readU32(bytes, offset);
    const boxType = toString(bytes, offset + 4, offset + 8);
    if (boxSize === 0) boxSize = end - offset;
    if (offset + boxSize > end || boxSize < 8) break;

    if (boxType === "mvhd") {
      const version = bytes[offset + 8] ?? 0;
      if (version === 0) {
        if (offset + 28 > end) break;
        const timescale = readU32(bytes, offset + 20);
        const duration = readU32(bytes, offset + 24);
        return timescale > 0 ? duration / timescale : null;
      } else {
        if (offset + 40 > end) break;
        const timescale = readU32(bytes, offset + 28);
        const duration = readU64(bytes, offset + 32);
        return timescale > 0 ? duration / timescale : null;
      }
    }

    if (boxType === "moov") {
      const res = findBoxDuration(bytes, offset + 8, offset + boxSize);
      if (res !== null) return res;
    }

    offset += boxSize;
  }
  return null;
}

function leadingZeros(b: number): number {
  let count = 0;
  let mask = 0x80;
  while (count < 8 && !(b & mask)) {
    count++;
    mask >>= 1;
  }
  return count;
}

function readEbmlId(bytes: Uint8Array, offset: number): { id: number; next: number } | null {
  if (offset >= bytes.length) return null;
  const b = bytes[offset] ?? 0;
  if (b === 0) return null;
  const length = leadingZeros(b) + 1;
  if (length > 4 || offset + length > bytes.length) return null;
  let value = 0;
  for (let i = 0; i < length; i++) {
    value = value * 256 + (bytes[offset + i] ?? 0);
  }
  return { id: value, next: offset + length };
}

function readEbmlSize(bytes: Uint8Array, offset: number): { size: number; next: number } | null {
  if (offset >= bytes.length) return null;
  const b = bytes[offset] ?? 0;
  if (b === 0xff) return null;
  const length = leadingZeros(b) + 1;
  if (length > 8 || offset + length > bytes.length) return null;
  let value = 0;
  for (let i = 0 + 1; i < length; i++) {
    value = (value << 8) | (bytes[offset + i] ?? 0);
  }
  value |= b & (0x7f >> (length - 1));
  return { size: value, next: offset + length };
}

function parseWebmDuration(bytes: Uint8Array): number | null {
  try {
    let off = 0;
    while (off + 8 <= bytes.length) {
      const id = readEbmlId(bytes, off);
      if (!id) break;
      const sz = readEbmlSize(bytes, id.next);
      if (!sz || sz.size < 0) break;
      const bodyStart = sz.next;
      const bodyEnd = bodyStart + sz.size;
      if (bodyEnd > bytes.length) break;

      if (id.id === 0x18538067) {
        let segOff = bodyStart;
        while (segOff + 8 <= bodyEnd) {
          const segId = readEbmlId(bytes, segOff);
          if (!segId) break;
          const segSz = readEbmlSize(bytes, segId.next);
          if (!segSz || segSz.size < 0) break;
          const segBody = segSz.next;
          const segBodyEnd = segBody + segSz.size;
          if (segBodyEnd > bodyEnd) break;

          if (segId.id === 0x1549a966) {
            let infoOff = segBody;
            while (infoOff + 8 <= segBodyEnd) {
              const infoId = readEbmlId(bytes, infoOff);
              if (!infoId) break;
              const infoSz = readEbmlSize(bytes, infoId.next);
              if (!infoSz || infoSz.size < 0) break;
              const infoBody = infoSz.next;

              if (infoId.id === 0x4489 && infoSz.size === 8 && infoBody + 8 <= bytes.length) {
                return readDoubleBE(bytes, infoBody) / 1000;
              }
              infoOff = infoBody + infoSz.size;
            }
          }
          segOff = segBody + segSz.size;
        }
      }
      off = bodyEnd;
    }
  } catch {
    return null;
  }
  return null;
}

function readDoubleBE(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getFloat64(offset, false);
}