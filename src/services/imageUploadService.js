import { supabase } from '../lib/supabase';

export const imageUploadService = {
  // Upload image to Supabase storage
  async uploadIssueImage(file, issueId, userId) {
    try {
      // Generate unique file name
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${issueId}/${Date.now()}_${Math.random()?.toString(36)?.substring(2)}.${fileExt}`;
      
      // Upload to storage bucket
      const { data: uploadData, error: uploadError } = await supabase?.storage?.from('issue-images')?.upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase?.storage?.from('issue-images')?.getPublicUrl(fileName);

      // Save image record to database
      const { data: imageData, error: dbError } = await supabase?.from('issue_images')?.insert([{
          issue_id: issueId,
          image_path: fileName,
          image_url: urlData?.publicUrl,
          uploaded_by: userId
        }])?.select()?.single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase?.storage?.from('issue-images')?.remove([fileName]);
        throw dbError;
      }

      return { 
        data: {
          id: imageData?.id,
          path: fileName,
          url: urlData?.publicUrl,
          publicUrl: urlData?.publicUrl
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { data: null, error: error?.message };
    }
  },

  // Upload multiple images
  async uploadMultipleImages(files, issueId, userId) {
    try {
      const uploadPromises = files?.map(file => 
        this.uploadIssueImage(file, issueId, userId)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = [];
      const failed = [];

      results?.forEach((result, index) => {
        if (result?.status === 'fulfilled' && !result?.value?.error) {
          successful?.push(result?.value?.data);
        } else {
          failed?.push({
            fileName: files?.[index]?.name,
            error: result?.value?.error || result?.reason
          });
        }
      });

      return {
        data: {
          successful,
          failed,
          totalUploaded: successful?.length,
          totalFailed: failed?.length
        },
        error: failed?.length > 0 ? `${failed?.length} uploads failed` : null
      };
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get images for an issue
  async getIssueImages(issueId) {
    try {
      const { data, error } = await supabase?.from('issue_images')?.select('*')?.eq('issue_id', issueId)?.order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching issue images:', error);
      return { data: [], error: error?.message };
    }
  },

  // Delete an image
  async deleteImage(imageId, userId) {
    try {
      // Get image details first
      const { data: imageData, error: fetchError } = await supabase?.from('issue_images')?.select('image_path, uploaded_by')?.eq('id', imageId)?.single();

      if (fetchError) {
        throw fetchError;
      }

      // Check if user owns the image or is admin
      const { data: { user } } = await supabase?.auth?.getUser();
      const isAdmin = user?.user_metadata?.role === 'admin';
      
      if (imageData?.uploaded_by !== userId && !isAdmin) {
        throw new Error('Unauthorized to delete this image');
      }

      // Delete from storage
      const { error: storageError } = await supabase?.storage?.from('issue-images')?.remove([imageData?.image_path]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase?.from('issue_images')?.delete()?.eq('id', imageId);

      if (dbError) {
        throw dbError;
      }

      return { data: { deleted: true }, error: null };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get public URL for an image
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    const { data } = supabase?.storage?.from('issue-images')?.getPublicUrl(imagePath);
    
    return data?.publicUrl;
  },

  // Validate file before upload
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    
    if (file?.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes?.includes(file?.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }
    
    return { valid: true, error: null };
  },

  // Create thumbnail (client-side resize)
  async createThumbnail(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

export default imageUploadService;