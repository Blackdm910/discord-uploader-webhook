'use client';
import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/app/actions";
import FileUploader from "@/components/file-uploader";
import FileList from "@/components/file-list";
import ImagePreviewModal from "@/components/image-preview-modal";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { File as LucideFile, List, Code, Image, Film, Music, Book, Package, FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider"
import dynamic from 'next/dynamic';
import { useBackground } from "@/hooks/use-background";
import { TooltipProvider } from "@/components/ui/tooltip";

interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

const generateUniqueId = (file: File) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${file.name}-${file.size}-${timestamp}-${random}`;
};

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFileListOpen, setIsFileListOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { backgroundImageUrl } = useBackground();

  const [Sun, setSun] = useState<any>(null);
  const [Moon, setMoon] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the icons
    import('lucide-react')
      .then(mod => {
        setSun(mod.Sun);
        setMoon(mod.Moon);
      })
      .catch(err => {
        console.error("Failed to load icons:", err);
      });
  }, []);

  const buttonClass = "rounded-full border border-gray-300 p-2 hover:bg-gray-200";

  const handleFiles = useCallback(
    (files: File[]) => {
      const newFiles = files
        .filter((file) => {
          const isDuplicate = selectedFiles.find(
            (f) => f.file.name === file.name && f.file.size === file.size,
          );
          const isTooBig = file.size > 10 * 1024 * 1024;
          
          if (isDuplicate) {
            setTimeout(() => {
              toast({
                title: "Duplicate file skipped",
                description: `${file.name} is already in the list.`,
                variant: "default",
              });
            }, 0);
            return false;
          }
          if (isTooBig) {
            setTimeout(() => {
              toast({
                title: "File too large",
                description: `${file.name} (${formatBytes(file.size)}) exceeds 10MB.`,
                variant: "destructive",
              });
            }, 0);
            return false;
          }
          return true;
        })
        .map((file) => {
          const uniqueId = generateUniqueId(file);
          setTimeout(() => {
            toast({
              title: "File added",
              description: `${file.name} added to the upload queue.`,
            });
          }, 0);
          return {
            id: uniqueId,
            file,
            status: "pending" as const,
          };
        });

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const fileInput = document.getElementById(
        "file-upload-input",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
    [selectedFiles],
  );

  const uploadAllFiles = useCallback(async () => {
    const filesToUpload = selectedFiles.filter(
      (f) => f.status === "pending" || f.status === "error",
    );
    if (filesToUpload.length === 0) {
      toast({ title: "No files to upload.", variant: "default" });
      return;
    }
    setIsUploading(true);
    setSelectedFiles((prev) =>
      prev.map((f) =>
        filesToUpload.some((ftu) => ftu.id === f.id)
          ? { ...f, status: "uploading", error: undefined }
          : f,
      ),
    );

    const filesData = filesToUpload.map((f) => f.file);
    try {
      const results = await uploadFiles(filesData);

      setSelectedFiles((prev) => {
        const updated = [...prev];
        if (results.urls && Array.isArray(results.urls)) {
          results.urls.forEach((url: string, index: number) => {
            const originalFile = filesData[index];
            const fileIndex = updated.findIndex(
              (f) =>
                f.file.name === originalFile.name &&
                f.file.size === originalFile.size &&
                f.status === "uploading",
            );
            if (fileIndex !== -1) {
              updated[fileIndex] = {
                ...updated[fileIndex],
                status: "success",
                url: url,
              };
              setTimeout(() => {
                toast({
                  title: "File Uploaded",
                  description: `${originalFile.name} uploaded successfully.`,
                });
              }, 0);
            }
          });
        }
        return updated.map((f) => {
          if (f.status === "uploading") {
            setTimeout(() => {
              toast({
                title: "Upload Failed",
                description: `Failed to upload ${f.file.name}.`,
                variant: "destructive",
              });
            }, 0);
            return {
              ...f,
              status: "error",
              error: "Upload failed or response missing.",
            };
          }
          return f;
        });
      });
      setTimeout(() => {
        toast({
          title: "Upload Processed",
          description: `Finished processing ${filesToUpload.length} file(s).`,
        });
      }, 0);
    } catch (error: any) {
      setSelectedFiles((prev) =>
        prev.map((f) => {
          if (f.status === "uploading") {
            setTimeout(() => {
              toast({
                title: "Upload Failed",
                description: `Failed to upload ${f.file.name}.`,
                variant: "destructive",
              });
            }, 0);
            return {
              ...f,
              status: "error",
              error: error?.message || "Batch upload failed",
            };
          }
          return f;
        }),
      );
      setTimeout(() => {
        toast({
          title: "Upload Error",
          description: "Batch upload failed.",
          variant: "destructive",
        });
      }, 0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles]);

  const uploadIndividualFile = useCallback(async (fileId: string) => {
    const fileItem = selectedFiles.find((f) => f.id === fileId);
    if (
      !fileItem ||
      fileItem.status === "success" ||
      fileItem.status === "uploading"
    )
      return;

    setSelectedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "uploading", error: undefined } : f,
      ),
    );
    try {
      const result = await uploadFiles([fileItem.file]);
      if (!result || !result.urls || result.urls.length === 0)
        throw new Error("Invalid server response.");
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "success", url: result.urls[0] }
            : f,
        ),
      );
      setTimeout(() => {
        toast({
          title: "File Uploaded",
          description: `${fileItem.file.name} uploaded.`,
        });
      }, 0);
    } catch (error: any) {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: error.message || "Upload failed" }
            : f,
        ),
      );
      setTimeout(() => {
        toast({
          title: "Upload Failed",
          description: `${fileItem.file.name}: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }, 0);
    }
  }, [selectedFiles]);

  const removeFile = useCallback((fileId: string) => {
    const fileToRemove = selectedFiles.find(f => f.id === fileId);
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));

    if (fileToRemove) {
      setTimeout(() => {
        toast({
          title: "File removed",
          description: `${fileToRemove.file.name} removed from the list.`,
        });
      }, 0);
    }
  }, [selectedFiles]);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setTimeout(() => {
      toast({
        title: "All files cleared",
        description: "The upload queue has been cleared.",
      });
    }, 0);
  }, []);

  const handleCopyClick = useCallback((text: string | undefined) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setTimeout(() => {
          toast({ title: "URL Copied!" });
        }, 0);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        setTimeout(() => {
          toast({ title: "Copy Failed", variant: "destructive" });
        }, 0);
      });
  }, []);

  const openPreview = (file: File) => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(URL.createObjectURL(file));
  };
  const closePreview = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
  };

  const canUpload = selectedFiles.some(
    (f) => f.status === "pending" || f.status === "error",
  );

  const pendingFilesCount = selectedFiles.filter(f => f.status === "pending" || f.status === "error").length;

  return (
    <div 
      className="fixed inset-0 min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: backgroundImageUrl || 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Card className="w-full max-w-lg glass-effect rounded-container">
        <CardHeader className="border-b border-border/10 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Discord File Uploader
            </CardTitle>
            <div className="flex gap-3">
              {Sun && Moon && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
                  className="rounded-full hover:bg-accent"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              {selectedFiles.length > 0 && (
                <Drawer open={isFileListOpen} onOpenChange={setIsFileListOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent">
                      <List className="w-5 h-5" />
                      <span className="sr-only">View Files</span>
                      {pendingFilesCount > 0 && (
                        <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black dark:text-white bg-white dark:bg-black border-2 border-border rounded-full -top-2 -right-2">
                          {pendingFilesCount}
                        </div>
                      )}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="backdrop-blur-lg bg-white/5 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl">
                    <DrawerHeader>
                      <DrawerTitle className="text-foreground">Files Queue</DrawerTitle>
                      <DrawerDescription>
                        Manage your selected files for upload
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="mx-auto w-full max-w-lg">
                      <TooltipProvider>
                        <FileList
                          selectedFiles={selectedFiles}
                          formatBytes={formatBytes}
                          getIcon={getIcon}
                          uploadIndividualFile={uploadIndividualFile}
                          removeFile={removeFile}
                          handleCopyClick={handleCopyClick}
                          openPreview={openPreview}
                          isUploading={isUploading}
                          uploadAllFiles={uploadAllFiles}
                          clearAllFiles={clearAllFiles}
                          canUpload={canUpload}
                        />
                      </TooltipProvider>
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <FileUploader handleFiles={handleFiles} />
        </CardContent>
      </Card>
      <ImagePreviewModal
        previewImage={previewImage}
        closePreview={closePreview}
        toast={toast}
      />
    </div>
  );
}

// Helper function to truncate filename while keeping extension
const truncateFilename = (name: string, maxChars: number = 30): string => {
  if (name.length <= maxChars) return name;

  const extSeparator = name.lastIndexOf(".");
  if (
    extSeparator === -1 ||
    extSeparator === 0 ||
    extSeparator === name.length - 1
  ) {
    return name.substring(0, maxChars - 3) + "...";
  }

  const extension = name.substring(extSeparator);
  const baseName = name.substring(0, extSeparator);
  const availableBaseLength = maxChars - extension.length - 3;

  if (availableBaseLength < 1) {
    return name.substring(0, maxChars - 3) + "...";
  }

  const truncatedBase =
    baseName.length > availableBaseLength
      ? baseName.substring(0, availableBaseLength)
      : baseName;

  return truncatedBase + "..." + extension;
};

// Format bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let b = bytes;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${i === 0 ? b : b.toFixed(1)} ${units[i]}`;
};

// Get icon based on file extension
const getIcon = (name: string) => {
  if (name.endsWith(".js")) return "Code";
  if (name.endsWith(".json")) return "Code";
  if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "Image";
  if (name.match(/\.(mp4|mov|avi|mkv)$/i)) return "Film";
  if (name.match(/\.(mp3|wav|ogg)$/i)) return "Music";
  if (name.match(/\.(pdf)$/i)) return "Book";
  if (name.match(/\.(zip|rar|7z)$/i)) return "Package";
  return "FileText";
};
