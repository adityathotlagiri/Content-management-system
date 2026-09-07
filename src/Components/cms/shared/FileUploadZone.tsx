import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface FileUploadZoneProps {
  accept: string; // e.g. "video/mp4,video/webm,video/quicktime"
  label: string;
  hint?: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  error?: string;
}

export function FileUploadZone({
  accept,
  label,
  hint,
  selectedFile,
  onFileSelect,
  error,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8
          flex flex-col items-center justify-center text-center
          transition-colors
          ${isDragging ? "border-[#238B45] bg-[#238B45]/5" : "border-gray-300 hover:border-gray-400"}
          ${error ? "border-red-400 bg-red-50" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-1">
            <p className="font-medium text-gray-800 break-all">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">Click or drop to replace</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-700 font-medium">
              Drag & drop a file here, or click to browse
            </p>
            {hint && <p className="text-sm text-gray-500">{hint}</p>}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}