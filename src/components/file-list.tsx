"use client";
import React from "react";
import { Upload, Trash2, Copy, Image as ImageIcon, RotateCw, ExternalLink, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FileListProps {
  selectedFiles: Array<{
    id: string;
    file: File;
    status: "pending" | "uploading" | "success" | "error";
    url?: string;
    error?: string;
  }>;
  formatBytes: (bytes: number) => string;
  getIcon: (name: string) => string;
  uploadIndividualFile: (fileId: string) => Promise<void>;
  removeFile: (fileId: string) => void;
  handleCopyClick: (text: string | undefined) => void;
  openPreview: (file: File) => void;
  isUploading: boolean;
  uploadAllFiles: () => Promise<void>;
  clearAllFiles: () => void;
  canUpload: boolean;
}

export default function FileList({
  selectedFiles,
  formatBytes,
  getIcon,
  uploadIndividualFile,
  removeFile,
  handleCopyClick,
  openPreview,
  isUploading,
  uploadAllFiles,
  clearAllFiles,
  canUpload,
}: FileListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      case "uploading":
        return <RotateCw className="w-4 h-4 animate-spin" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const getTruncatedFilename = (filename: string) => {
    const maxLength = 20;
    const ext = filename.split('.').pop();
    const name = filename.slice(0, filename.lastIndexOf('.'));
    
    if (name.length <= maxLength) return filename;
    
    return `${name.slice(0, maxLength)}...${ext ? `.${ext}` : ''}`;
  };

  return (
    <div className="p-4 space-y-4">
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between gap-2 mb-4">
          <Button
            variant="default"
            size="sm"
            onClick={uploadAllFiles}
            disabled={!canUpload || isUploading}
            className="flex-1 rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/20 text-white/90 shadow"
          >
            {isUploading ? (
              <>
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2 " />
                Upload All
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFiles}
            disabled={isUploading}
            className="flex-1 rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/20 text-white/90 shadow"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[50vh] pr-4">
        <div className="space-y-3">
          {selectedFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                "group relative flex items-center gap-4 rounded-xl border p-3 transition-all",
                file.status === "uploading" && "animate-pulse",
                file.status === "success" && "bg-green-500/5 border-green-500/20",
                file.status === "error" && "bg-red-500/5 border-red-500/20"
              )}
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  file.status === "success" && "bg-green-500/10 text-green-500",
                  file.status === "error" && "bg-red-500/10 text-red-500",
                  file.status === "uploading" && "bg-blue-500/10 text-blue-500",
                  file.status === "pending" && "bg-gray-500/10 text-gray-500"
                )}>
                  {getStatusIcon(file.status)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-medium truncate">
                        {getTruncatedFilename(file.file.name)}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{file.file.name}</TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.file.size)}
                  </span>
                  {file.error && (
                    <span className="text-xs text-red-500">{file.error}</span>
                  )}
                  {file.url && (
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs rounded-full"
                        onClick={() => handleCopyClick(file.url)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs rounded-full"
                        asChild
                      >
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.file.type.startsWith("image/") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => openPreview(file.file)}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                )}
                {(file.status === "pending" || file.status === "error") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => uploadIndividualFile(file.id)}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => removeFile(file.id)}
                  disabled={isUploading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
