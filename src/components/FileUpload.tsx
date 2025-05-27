import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import clsx from 'clsx';

interface FileUploadProps {
  onUpload: (url: string, fileName: string) => void;
  onError?: (error: Error) => void;
  folder: string;
  accept?: string;
  maxSize?: number;
}

export const FileUpload = ({ 
  onUpload, 
  onError, 
  folder,
  accept = 'application/pdf',
  maxSize = 26214400 // 25MB
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, uploading, error } = useFileUpload({
    folder,
    onSuccess: (url, fileName) => {
      setSelectedFile(null);
      onUpload(url, fileName);
    },
    onError
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.match(accept)) {
      onError?.(new Error('Invalid file type. Please upload a PDF file.'));
      return;
    }

    if (file.size > maxSize) {
      onError?.(new Error('File is too large. Maximum size is 25MB.'));
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await upload(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={clsx(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300",
          "hover:border-primary-400 hover:bg-gray-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <button
              type="button"
              className="text-sm font-semibold text-primary-600 hover:text-primary-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Upload a file
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept={accept}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            PDF up to 25MB
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-500"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error.message}
        </div>
      )}
    </div>
  );
};