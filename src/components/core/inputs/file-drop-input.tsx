import React, { useRef, useState } from "react";

interface FileDropInputProps {
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileDropInput({ accept, file, onFileChange }: FileDropInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  return (
    <div
      className={`border-4 border-dotted rounded-lg px-4 py-10 text-center cursor-pointer transition-colors duration-150 bg-transparent
        border-[#5C2A2B]
        ${dragActive ? "border-[#EFCB7B] bg-yellow-50" : ""}
        hover:border-[#FFD580] focus:border-[#FFD580] outline-none`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      tabIndex={0}
      role="button"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) =>
          onFileChange(e.target.files && e.target.files[0] ? e.target.files[0] : null)
        }
      />
      {file ? (
        <span className="text-[#5C2A2B] font-medium">{file.name}</span>
      ) : (
        <span className="text-[#8B5E5E] font-medium">
          Drag & drop a file here, or click to select
        </span>
      )}
    </div>
  );
}
