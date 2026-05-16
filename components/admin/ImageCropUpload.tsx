"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, Loader, X, ZoomIn } from "lucide-react";
import { getCroppedImageDataUrl } from "@/lib/crop-image";
import type { SettingsSubfolder } from "@/lib/supabase-storage";
import { dataUrlToFile, uploadSettingsImage } from "@/lib/upload-settings-image";

type ImageCropUploadProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspect: number;
  /** Preview box aspect ratio (defaults to `aspect`). Use to match sibling upload slots. */
  previewAspect?: number;
  /** Max width of the saved JPEG (keeps settings payload smaller). */
  outputMaxWidth?: number;
  previewClassName?: string;
  /** When set, cropped image is uploaded to Supabase before `onChange` receives the public URL. */
  uploadSubfolder?: SettingsSubfolder;
  onUploadError?: (message: string) => void;
};

export function ImageCropUpload({
  label,
  hint,
  value,
  onChange,
  aspect,
  previewAspect,
  outputMaxWidth,
  previewClassName,
  uploadSubfolder,
  onUploadError,
}: ImageCropUploadProps) {
  const inputId = useId();
  const [mounted, setMounted] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const boxAspect = previewAspect ?? aspect;
  const aspectLabel = aspect === 1 ? "1:1" : "16:9";
  const hasFixedPreviewHeight =
    previewClassName != null && /\b(h-|max-h-|min-h-)/.test(previewClassName);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cropOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cropOpen]);

  const resetCropState = () => {
    setCropOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setCropOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setApplying(true);
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels, outputMaxWidth);
      if (uploadSubfolder) {
        const file = dataUrlToFile(dataUrl, "cropped.jpg");
        const url = await uploadSettingsImage(file, uploadSubfolder, file.name);
        onChange(url);
      } else {
        onChange(dataUrl);
      }
      resetCropState();
    } catch (err) {
      console.error("Crop failed:", err);
      onUploadError?.(
        err instanceof Error ? err.message : "Image upload failed. Try again.",
      );
    } finally {
      setApplying(false);
    }
  };

  const cropModal =
    cropOpen && imageSrc ? (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-crop-title`}
      >
        <div className="my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p id={`${inputId}-crop-title`} className="text-sm font-bold text-white">
              Crop image ({aspectLabel})
            </p>
            <button
              type="button"
              onClick={resetCropState}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close crop"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative h-[min(50vh,320px)] w-full shrink-0 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
            <ZoomIn size={16} className="shrink-0 text-slate-400" aria-hidden />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="min-w-0 flex-1 accent-yellow-500"
              aria-label="Zoom"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={resetCropState}
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={applying || !croppedAreaPixels}
              onClick={handleApplyCrop}
              className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {applying ? <Loader className="animate-spin" size={16} /> : null}
              Apply crop
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}

      <div
        className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] ${previewClassName ?? ""}`}
        style={hasFixedPreviewHeight ? undefined : { aspectRatio: boxAspect }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-contain p-3" />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-white"
              >
                Change
              </label>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Camera size={28} className="opacity-60" />
            <span className="text-xs font-semibold">Click to upload</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Crop {aspectLabel}</span>
          </label>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {mounted && cropModal ? createPortal(cropModal, document.body) : null}
    </div>
  );
}
