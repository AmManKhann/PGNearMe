"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Loader2,
  Film,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  MAX_IMAGES,
  MAX_VIDEOS,
  MAX_VIDEO_SECONDS,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/lib/media";

interface UploadItem {
  key: string;
  kind: "image" | "video";
  url?: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
  duration?: number;
}

interface MediaUploadProps {
  initialImages?: string[];
  initialVideos?: string[];
  onChange: (images: string[], videos: string[]) => void;
}

function getImageExt(file: File): string | null {
  const m = /^image\/(jpe?g|png|webp)$/i.exec(file.type);
  if (!m) return null;
  const norm =
    m[1].toLowerCase() === "jpeg" ? ".jpg" : `.${m[1].toLowerCase()}`;
  const cleaned = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return cleaned ? cleaned[1] : norm;
}

function getVideoExt(file: File): string | null {
  const m = /^video\/(mp4|quicktime|x-m4v|webm)$/i.exec(file.type);
  if (!m) return null;
  if (m[1].toLowerCase() === "quicktime" || m[1].toLowerCase() === "x-m4v")
    return ".mov";
  return `.${m[1].toLowerCase()}`;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadedmetadata = () => {
      cleanup();
      resolve(video.duration || 0);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video metadata"));
    };
    setTimeout(() => {
      cleanup();
      reject(new Error("Timed out reading video"));
    }, 10000);
  });
}

export function MediaUpload({
  initialImages = [],
  initialVideos = [],
  onChange,
}: MediaUploadProps) {
  const [items, setItems] = useState<UploadItem[]>(() => [
    ...initialImages.map((url, i) => ({
      key: `init-img-${i}-${url}`,
      kind: "image" as const,
      url,
      previewUrl: url,
      status: "done" as const,
      progress: 100,
    })),
    ...initialVideos.map((url, i) => ({
      key: `init-vid-${i}-${url}`,
      kind: "video" as const,
      url,
      previewUrl: url,
      status: "done" as const,
      progress: 100,
    })),
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "info"; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imageCount = items.filter((i) => i.kind === "image" && i.status !== "error").length;
  const videoCount = items.filter((i) => i.kind === "video" && i.status !== "error").length;

  const showToast = useCallback((type: "error" | "info", msg: string) => {
    setToast({ type, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const emitChange = useCallback(
    (next: UploadItem[]) => {
      onChange(
        next.filter((i) => i.kind === "image" && i.url && i.status === "done").map((i) => i.url as string),
        next.filter((i) => i.kind === "video" && i.url && i.status === "done").map((i) => i.url as string)
      );
    },
    [onChange]
  );

  const uploadFile = useCallback(
    async (file: File, kind: "image" | "video") => {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const previewUrl = URL.createObjectURL(file);
      const item: UploadItem = { key, kind, previewUrl, status: "uploading", progress: 0 };

      setItems((prev) => {
        const next = [...prev, item];
        emitChange(next);
        return next;
      });

      const form = new FormData();
      form.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setItems((prev) =>
            prev.map((it) => (it.key === key ? { ...it, progress: Math.min(100, pct) } : it))
          );
        }
      };
      xhr.onload = () => {
        let data: { url?: string; error?: string } = {};
        try {
          data = JSON.parse(xhr.responseText) as { url?: string; error?: string };
        } catch {
          data = { error: "Upload failed. Please try again." };
        }
        setItems((prev) => {
          const next = prev.map((it) =>
            it.key === key
              ? {
                  ...it,
                  status: xhr.status >= 200 && xhr.status < 300 && data.url ? ("done" as const) : ("error" as const),
                  url: data.url,
                  progress: xhr.status >= 200 && xhr.status < 300 ? 100 : it.progress,
                  error: data.error ?? (xhr.status >= 200 && xhr.status < 300 ? undefined : "Upload failed. Please try again."),
                }
              : it
          );
          emitChange(next);
          return next;
        });
        if (xhr.status < 200 || xhr.status >= 300) {
          showToast("error", data.error ?? "Upload failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setItems((prev) => {
          const next = prev.map((it) =>
            it.key === key ? { ...it, status: "error" as const, error: "Upload failed. Please try again." } : it
          );
          emitChange(next);
          return next;
        });
        showToast("error", "Upload failed. Please try again.");
      };
      xhr.send(form);
    },
    [emitChange, showToast]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const images = list.filter((f) => getImageExt(f));
      const videos = list.filter((f) => getVideoExt(f));

      if (images.length + videos.length !== list.length) {
        showToast(
          "error",
          "Some files were skipped. Only JPG, PNG, WEBP images and MP4, MOV, WEBM videos are allowed."
        );
      }

      for (const img of images.slice(0, MAX_IMAGES - imageCount)) {
        if (img.size > MAX_IMAGE_SIZE) {
          showToast("error", `${img.name} is over 5MB. Images must be 5MB or smaller.`);
          continue;
        }
        await uploadFile(img, "image");
      }
      for (const vid of videos.slice(0, MAX_VIDEOS - videoCount)) {
        if (vid.size > MAX_VIDEO_SIZE) {
          showToast("error", `${vid.name} is over 50MB. Videos must be 50MB or smaller.`);
          continue;
        }
        try {
          const duration = await getVideoDuration(vid);
          if (duration > MAX_VIDEO_SECONDS) {
            showToast("error", "Videos must be 30 seconds or shorter.");
            continue;
          }
          await uploadFile(vid, "video");
        } catch {
          showToast("error", `Could not read ${vid.name}. Try a different video.`);
        }
      }

      if (imageCount >= MAX_IMAGES) {
        showToast("info", `Maximum ${MAX_IMAGES} images reached.`);
      }
      if (videoCount >= MAX_VIDEOS) {
        showToast("info", `Maximum ${MAX_VIDEOS} videos reached.`);
      }
    },
    [imageCount, videoCount, uploadFile, showToast]
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const removeItem = (key: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.key !== key);
      emitChange(next);
      return next;
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const imagesRemaining = MAX_IMAGES - imageCount;
  const videosRemaining = MAX_VIDEOS - videoCount;
  const addDisabled = imagesRemaining <= 0 && videosRemaining <= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-semibold text-foreground">
            <ImagePlus className="w-3.5 h-3.5 text-primary-light" />
            Images: {imageCount}/{MAX_IMAGES} uploaded
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-semibold text-foreground">
            <Film className="w-3.5 h-3.5 text-accent" />
            Videos: {videoCount}/{MAX_VIDEOS} uploaded
          </span>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !addDisabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : addDisabled
              ? "border-border bg-surface/50 cursor-not-allowed"
              : "border-border bg-surface hover:border-primary/50"
        }`}
      >
        <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
        <p className="text-sm text-foreground font-medium mb-1">
          Drag &amp; drop or click to upload
        </p>
        <p className="text-xs text-muted">
          Images: JPG, PNG, WEBP (max 5MB each, up to {imagesRemaining} more) &nbsp;•&nbsp; Videos:
          MP4, MOV, WEBM (max 30s, up to {videosRemaining} more)
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            type="button"
            disabled={imagesRemaining <= 0}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-all neon-glow disabled:opacity-40"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Add Images
          </button>
          <button
            type="button"
            disabled={videosRemaining <= 0}
            onClick={(e) => {
              e.stopPropagation();
              showToast("info", "Choose a video (MP4, MOV, WEBM, max 30 seconds)");
              inputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-all disabled:opacity-40"
          >
            <Film className="w-3.5 h-3.5" />
            Add Video
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-primary/5 border-primary/20 text-primary-light"
          }`}
          role="status"
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted mb-2">
            Preview &amp; manage ({items.length} files)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="relative aspect-video rounded-xl border border-border overflow-hidden bg-black group"
              >
                {item.status === "error" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-red-50 p-2 text-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-[10px] text-red-600 line-clamp-2 break-all">
                      {item.error ?? "Upload failed"}
                    </span>
                  </div>
                ) : (
                  <>
                    {item.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={item.previewUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                          <Film className="w-3 h-3" />
                          {item.duration !== undefined && item.duration > 0
                            ? `${item.duration.toFixed(1)}s`
                            : "video"}
                        </span>
                      </div>
                    )}

                    {item.kind === "image" && item.status === "done" && (
                      <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      </span>
                    )}

                    {item.status === "uploading" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 p-2">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
                          <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white font-medium">
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label="Remove media"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        Videos must be {MAX_VIDEO_SECONDS} seconds or shorter. Uploaded videos play directly
        on the listing page. You can remove any file below before saving.
      </p>
    </div>
  );
}