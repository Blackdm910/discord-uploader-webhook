"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ChevronUp } from "lucide-react";

interface FileUploaderProps {
  handleFiles: (files: File[]) => void;
}

export default function FileUploader({ handleFiles }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFiles(acceptedFiles);
    },
    [handleFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative p-8 border-2 border-dashed rounded-[var(--radius-lg)] cursor-pointer transition-all duration-300
        ${isDragActive
          ? "border-primary bg-primary/5 scale-102 shadow-xl"
          : "border-border hover:border-primary/50 hover:bg-accent/50"
        }
      `}
    >
      <input {...getInputProps()} id="file-upload-input" />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className={`p-4 rounded-full transition-all duration-300 ${
          isDragActive ? "bg-primary/10 scale-110" : "bg-accent/10"
        }`}>
          {isDragActive ? (
            <ChevronUp className="w-8 h-8 text-primary animate-bounce" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isDragActive ? "Drop files here" : "Upload your files"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag & drop files here or click to select
            <br />
            <span className="text-xs opacity-75">Maximum file size: 10MB</span>
          </p>
        </div>
      </div>
    </div>
  );
}
