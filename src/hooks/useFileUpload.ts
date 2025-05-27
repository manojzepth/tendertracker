import { useState } from 'react';
import { uploadFile, deleteFile } from '../services/storage';

interface UseFileUploadOptions {
  folder: string;
  onSuccess?: (url: string, fileName: string) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload({ folder, onSuccess, onError }: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const url = await uploadFile(file, folder);
      onSuccess?.(url, file.name);
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string) => {
    try {
      await deleteFile(path);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete failed');
      setError(error);
      onError?.(error);
      throw error;
    }
  };

  return {
    upload,
    remove,
    uploading,
    error
  };
}