import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

function generateUniquePath(file: File, folder: string): string {
  const timestamp = new Date().getTime();
  const uuid = uuidv4();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}-${uuid}-${safeName}`;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    const path = generateUniquePath(file, folder);
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to upload file. Please try again.'
    );
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to delete file. Please try again.'
    );
  }
}