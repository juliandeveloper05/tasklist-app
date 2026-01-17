/**
 * File Manager Utility
 * TaskList App - Phase 2 Attachments
 * 
 * Handles file operations: save, delete, retrieve, cleanup
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { 
  STORAGE_CONFIG, 
  isAllowedType, 
  isImageType 
} from '../constants/storage';

// Base directory for attachments
const getAttachmentsDir = () => {
  return FileSystem.documentDirectory + STORAGE_CONFIG.ATTACHMENTS_DIR;
};

// Generate unique ID for attachments
const generateAttachmentId = () => {
  return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Ensure attachments directory exists
 */
export const ensureDirectoryExists = async () => {
  const dir = getAttachmentsDir();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  
  return dir;
};

/**
 * Get total storage used by attachments
 * @returns {Promise<number>} Total bytes used
 */
export const getTotalStorageUsed = async () => {
  try {
    const dir = getAttachmentsDir();
    const dirInfo = await FileSystem.getInfoAsync(dir);
    
    if (!dirInfo.exists) {
      return 0;
    }
    
    const files = await FileSystem.readDirectoryAsync(dir);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(dir + file);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating storage:', error);
    return 0;
  }
};

/**
 * Check if adding a file would exceed storage limit
 * @param {number} fileSize - Size of file to add
 * @returns {Promise<boolean>} True if adding file is allowed
 */
export const canAddFile = async (fileSize) => {
  const currentUsage = await getTotalStorageUsed();
  return (currentUsage + fileSize) <= STORAGE_CONFIG.MAX_LOCAL_STORAGE;
};

/**
 * Save file to local storage
 * @param {string} sourceUri - Source file URI
 * @param {string} taskId - Task ID to associate with
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} Saved file info
 */
export const saveFile = async (sourceUri, taskId, filename, mimeType) => {
  // Validate MIME type
  if (!isAllowedType(mimeType)) {
    throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
  }
  
  // Get file info to check size
  const fileInfo = await FileSystem.getInfoAsync(sourceUri);
  
  if (!fileInfo.exists) {
    throw new Error('El archivo no existe');
  }
  
  // Check file size
  if (fileInfo.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el límite de 10MB`);
  }
  
  // Check storage limit
  const canAdd = await canAddFile(fileInfo.size);
  if (!canAdd) {
    throw new Error('No hay suficiente espacio de almacenamiento');
  }
  
  // Ensure directory exists
  await ensureDirectoryExists();
  
  // Generate unique ID and destination path
  const attachmentId = generateAttachmentId();
  const extension = filename.split('.').pop() || '';
  const destFilename = `${attachmentId}.${extension}`;
  const destUri = getAttachmentsDir() + destFilename;
  
  // Copy file to attachments directory
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });
  
  return {
    id: attachmentId,
    taskId,
    filename,
    localUri: destUri,
    filesize: fileInfo.size,
    mimeType,
    type: isImageType(mimeType) ? 'image' : 'document',
    createdAt: new Date().toISOString(),
    uploadStatus: 'local', // local | uploading | uploaded | failed
  };
};

/**
 * Delete file from local storage
 * @param {string} localUri - Local file URI to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteFile = async (localUri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get file info
 * @param {string} localUri - Local file URI
 * @returns {Promise<Object|null>} File info or null
 */
export const getFileInfo = async (localUri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    return fileInfo.exists ? fileInfo : null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

/**
 * Read file as base64 (for thumbnails)
 * @param {string} localUri - Local file URI
 * @returns {Promise<string|null>} Base64 string or null
 */
export const readAsBase64 = async (localUri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error reading file as base64:', error);
    return null;
  }
};

/**
 * Get all files in attachments directory
 * @returns {Promise<string[]>} List of file paths
 */
export const getAllAttachmentFiles = async () => {
  try {
    const dir = getAttachmentsDir();
    const dirInfo = await FileSystem.getInfoAsync(dir);
    
    if (!dirInfo.exists) {
      return [];
    }
    
    const files = await FileSystem.readDirectoryAsync(dir);
    return files.map(file => dir + file);
  } catch (error) {
    console.error('Error listing attachment files:', error);
    return [];
  }
};

/**
 * Clean up orphaned files (files not referenced by any task)
 * @param {string[]} validAttachmentUris - List of valid attachment URIs from tasks
 * @returns {Promise<number>} Number of files cleaned up
 */
export const cleanOrphanedFiles = async (validAttachmentUris) => {
  try {
    const allFiles = await getAllAttachmentFiles();
    const validSet = new Set(validAttachmentUris);
    let cleanedCount = 0;
    
    for (const filePath of allFiles) {
      if (!validSet.has(filePath)) {
        await deleteFile(filePath);
        cleanedCount++;
      }
    }
    
    console.log(`Cleaned up ${cleanedCount} orphaned files`);
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning orphaned files:', error);
    return 0;
  }
};

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage stats
 */
export const getStorageStats = async () => {
  try {
    const totalUsed = await getTotalStorageUsed();
    const allFiles = await getAllAttachmentFiles();
    
    let imageCount = 0;
    let documentCount = 0;
    let imageSize = 0;
    let documentSize = 0;
    
    for (const filePath of allFiles) {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const extension = filePath.split('.').pop()?.toLowerCase();
      
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(extension);
      
      if (isImage) {
        imageCount++;
        imageSize += fileInfo.size || 0;
      } else {
        documentCount++;
        documentSize += fileInfo.size || 0;
      }
    }
    
    return {
      totalUsed,
      maxStorage: STORAGE_CONFIG.MAX_LOCAL_STORAGE,
      usagePercent: (totalUsed / STORAGE_CONFIG.MAX_LOCAL_STORAGE) * 100,
      fileCount: allFiles.length,
      images: { count: imageCount, size: imageSize },
      documents: { count: documentCount, size: documentSize },
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalUsed: 0,
      maxStorage: STORAGE_CONFIG.MAX_LOCAL_STORAGE,
      usagePercent: 0,
      fileCount: 0,
      images: { count: 0, size: 0 },
      documents: { count: 0, size: 0 },
    };
  }
};

export default {
  ensureDirectoryExists,
  getTotalStorageUsed,
  canAddFile,
  saveFile,
  deleteFile,
  getFileInfo,
  readAsBase64,
  getAllAttachmentFiles,
  cleanOrphanedFiles,
  getStorageStats,
};
