import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, AlertCircle, Sparkles } from "lucide-react";

export interface ImageUploadProps {
  onImageSelected?: (file: File | null) => void;
  className?: string;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const SAMPLE_IMAGES = [
  {
    name: "pothole_sample_1.jpg",
    title: "Urban Pothole",
    path: "/samples/pothole_sample_1.jpg",
    desc: "Single prominent surface cavity",
  },
  {
    name: "pothole_sample_2.jpg",
    title: "Multiple Potholes",
    path: "/samples/pothole_sample_2.jpg",
    desc: "Cluster of asphalt distresses",
  },
  {
    name: "clean_road_sample.jpg",
    title: "Clean Road Surface",
    path: "/samples/clean_road_sample.jpg",
    desc: "Damage-free negative sample",
  },
];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  className = "",
  maxSizeMB = 10,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Invalid file type. Only .jpg, .jpeg, and .png files are accepted.");
        return;
      }

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File size exceeds the maximum limit of ${maxSizeMB} MB.`);
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelected?.(file);
    },
    [maxSizeMB, onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        validateAndProcessFile(e.dataTransfer.files[0]);
      }
    },
    [validateAndProcessFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        validateAndProcessFile(e.target.files[0]);
      }
    },
    [validateAndProcessFile]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onImageSelected?.(null);
    },
    [previewUrl, onImageSelected]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLoadSample = async (sample: (typeof SAMPLE_IMAGES)[0]) => {
    try {
      setLoadingSample(sample.name);
      setError(null);
      const res = await fetch(sample.path);
      if (!res.ok) throw new Error("Could not load sample image.");
      const blob = await res.blob();
      const file = new File([blob], sample.name, { type: "image/jpeg" });
      validateAndProcessFile(file);
    } catch (err) {
      setError("Failed to load sample image.");
    } finally {
      setLoadingSample(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          Roadway Inspection Imagery
        </label>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Max {maxSizeMB}MB • JPG, PNG
        </span>
      </div>

      {/* Dropzone Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center gap-3 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/30 ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10 scale-[1.005]"
            : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0E1524]/60 hover:bg-slate-50 dark:hover:bg-[#0E1524] hover:border-emerald-500/40"
        } shadow-xs backdrop-blur-md`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleChange}
          className="hidden"
          aria-label="Upload image file"
        />

        {previewUrl && selectedFile ? (
          <div className="relative w-full flex flex-col gap-3 items-center">
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center justify-center shadow-inner group">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white transition-all border border-slate-700/80 cursor-pointer shadow-md backdrop-blur-sm"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="w-full flex items-center justify-between px-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[70%]">
                {selectedFile.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-xs">
              <Upload className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag and drop roadway imagery, or browse file
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Supports high-resolution dashcam or UAV pavement captures
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl shadow-xs"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Demo Sample Loaders */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Or Test With Curated Benchmark Samples:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              disabled={loadingSample !== null}
              onClick={() => handleLoadSample(sample)}
              className="flex flex-col text-left p-3 rounded-xl bg-white/70 dark:bg-[#0E1524]/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sample.title}
                </span>
                {loadingSample === sample.name ? (
                  <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Load →
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {sample.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageUpload);
