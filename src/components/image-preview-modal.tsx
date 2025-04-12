"use client";
import React from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewModalProps {
  previewImage: string | null;
  closePreview: () => void;
  toast: any;
}

export default function ImagePreviewModal({
  previewImage,
  closePreview,
  toast,
}: ImagePreviewModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(previewImage!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "image-" + Date.now() + "." + blob.type.split("/")[1];
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Download started",
        description: "Your image download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  };

  if (!previewImage) return null;

  return (
    <Dialog open={!!previewImage} onOpenChange={(open) => !open && closePreview()}>
      <DialogContent className="max-w-4xl p-1 overflow-hidden bg-background/95 backdrop-blur-lg rounded-[var(--radius-xl)] border-0 shadow-2xl">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="absolute right-4 top-4 z-50 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleDownload}
            className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download image</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={closePreview}
            className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close preview</span>
          </Button>
        </div>
        
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[calc(var(--radius-xl)-4px)]">
          <img
            src={previewImage}
            alt="Preview"
            className="object-contain w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
