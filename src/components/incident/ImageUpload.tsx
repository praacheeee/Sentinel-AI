import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

export interface ImageUploadProps {
  onImageSelected?: (file: File | null) => void;
  className?: string;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  className = "",
  maxSizeMB = 10,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-semibold text-[#F0F6FC]">
        Upload Incident Image
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center gap-3 cursor-pointer outline-none focus:ring-2 focus:ring-[#58A6FF]/40 ${
          isDragging
            ? "border-[#58A6FF] bg-[#58A6FF]/10"
            : "border-[#30363D] bg-[#161B22]/50 hover:bg-[#161B22]"
        }`}
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
            <div className="relative w-full h-56 rounded-lg overflow-hidden border border-[#30363D] bg-[#0D1117] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-[#21262D]/90 hover:bg-[#DA3633] text-[#F0F6FC] transition-colors border border-[#30363D] cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="w-full flex items-center justify-between px-1 text-xs text-[#8B949E]">
              <span className="font-mono truncate max-w-[70%]">{selectedFile.name}</span>
              <span className="font-mono">{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-[#21262D] border border-[#30363D] text-[#58A6FF]">
              <Upload className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-center flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#F0F6FC]">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-[#8B949E]">
                PNG, JPG or JPEG (max. {maxSizeMB}MB)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8B949E] pt-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#58A6FF]" aria-hidden="true" />
              <span>Supports .jpg, .jpeg, .png</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#F85149] bg-[#DA3633]/15 border border-[#DA3633]/30 px-3 py-2 rounded-lg" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageUpload);