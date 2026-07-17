"use client";

import React from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import Label from "./Label";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export default function FileDropZone({
  title,
  subtitle,
  files,
  onFiles,
  multiple = true,
  maxFiles,
  defaultImageUrl,
}: {
  title: string;
  subtitle: string;
  files: File[];
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  defaultImageUrl?: string;
}) {
  const previews = React.useMemo(
    () =>
      files
        .filter((file) => file instanceof File)
        .map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
        })),
    [files],
  );

  React.useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;
    const validFiles = selectedFiles.filter((file) => {
      if (file.size <= MAX_IMAGE_SIZE_BYTES) {
        return true;
      }

      toast.error(`${file.name} is larger than 10MB.`);
      return false;
    });

    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    let newFiles: File[] = [];
    if (multiple) {
       // Append
       const existingFiles = files.filter(f => f instanceof File);
       newFiles = [...existingFiles, ...validFiles];
    } else {
       // Replace
       newFiles = validFiles;
    }

    if (typeof maxFiles === "number") {
      newFiles = newFiles.slice(0, maxFiles);
    }

    onFiles(newFiles);
    event.target.value = "";
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    onFiles(newFiles);
  };

  return (
    <div>
      {title ? <Label>{title}</Label> : null}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-[#274877] hover:bg-white">
        <Upload className="mx-auto h-8 w-8 text-slate-500" />
        <p className="mt-3 text-sm text-slate-700">Click to upload photos</p>
        <p className="mt-1 text-[0.72rem] text-slate-400">{subtitle}</p>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          className="mt-4 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
        />
      </div>
      {previews.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previews.map((file, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white group"
            >
              <div className="aspect-square bg-slate-100">
                {file.url ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="truncate px-2 py-2 text-[0.72rem] text-slate-600">
                {file.name}
              </p>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : defaultImageUrl ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-square bg-slate-100">
                <img
                  src={defaultImageUrl}
                  alt="Default Logo"
                  className="h-full w-full object-cover"
                />
            </div>
            <p className="truncate px-2 py-2 text-[0.72rem] text-slate-600">
              Default Logo
            </p>
          </div>
        </div>
      ) : files.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((fileName, index) => (
            <span
              key={index}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 flex items-center gap-1"
            >
              {typeof fileName === "string" ? fileName : fileName.name}
              <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 ml-1">✕</button>
            </span>
          ))}
        </div>
      ) : null}
      {typeof maxFiles === "number" ? (
        <p className="mt-2 text-xs text-slate-400">
          Maximum {maxFiles} file{maxFiles === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
