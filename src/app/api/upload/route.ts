import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  getImageExtension,
  getVideoExtension,
  getVideoDurationSec,
  MAX_VIDEO_SECONDS,
  isAllowedImageExt,
  isAllowedVideoExt,
} from "@/lib/media";
import { saveUpload } from "@/lib/uploadStore";

function randomFilename(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
}

function getUploadUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

type MediaKind = "image" | "video";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const rawName = file.name || "";

    const allowedImageExt =
      file.type.indexOf("image") === 0 && isAllowedImageExt(path.extname(rawName) || "");
    const allowedVideoExt =
      file.type.indexOf("video") === 0 && isAllowedVideoExt(path.extname(rawName) || "");
    const kind: MediaKind = allowedImageExt
      ? "image"
      : allowedVideoExt
        ? "video"
        : ("" as MediaKind);
    if (!kind) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Only JPG, PNG, WEBP (images) and MP4, MOV, WEBM (videos) are allowed.",
        },
        { status: 415 }
      );
    }

    const maxBytes = kind === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error:
            kind === "image"
              ? "Images must be 5MB or smaller."
              : "Videos must be 50MB or smaller.",
        },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const bytes = new Uint8Array(buffer);
    let ext: string | null;
    if (kind === "image") {
      ext = getImageExtension(bytes);
      if (!ext || !isAllowedImageExt(ext)) {
        return NextResponse.json(
          { error: "Image content does not match an allowed format." },
          { status: 415 }
        );
      }
    } else {
      ext = getVideoExtension(bytes);
      if (!ext || !isAllowedVideoExt(ext)) {
        return NextResponse.json(
          { error: "Video content does not match an allowed format." },
          { status: 415 }
        );
      }
      const duration = getVideoDurationSec(bytes);
      if (duration !== null && duration > MAX_VIDEO_SECONDS) {
        return NextResponse.json(
          { error: "Videos must be 30 seconds or shorter." },
          { status: 422 }
        );
      }
    }

    const filename = randomFilename(ext);
    await saveUpload(filename, buffer);

    return NextResponse.json({
      url: getUploadUrl(filename),
      kind,
      bytes: buffer.byteLength,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}