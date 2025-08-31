'use client';

import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, disabled = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      } ${disabled ? 'cursor-not-allowed bg-muted/50 opacity-60' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={!disabled ? handleClick : undefined}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <UploadCloud className={`h-10 w-10`} />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">
            {isDragging ? "Drop your image here!" : "Drag & drop an image or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">Supports PNG, JPG, WEBP, and more.</p>
        </div>
        <Button
            variant="outline"
            className="pointer-events-none mt-2"
        >
            <ImageIcon className="mr-2" />
            Select File
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={disabled}
      />
    </div>
  );
}
