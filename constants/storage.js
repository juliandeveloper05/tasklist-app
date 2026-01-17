/**
 * Storage Configuration Constants
 * TaskList App - Phase 2 Attachments
 */

// Storage limits
export const STORAGE_CONFIG = {
  MAX_LOCAL_STORAGE: 100 * 1024 * 1024, // 100MB total
  MAX_FILE_SIZE: 10 * 1024 * 1024,       // 10MB per file
  MAX_ATTACHMENTS_PER_TASK: 10,
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  IMAGE_MAX_SIZE: { width: 2048, height: 2048 },
  IMAGE_QUALITY: 0.8,
  ATTACHMENTS_DIR: 'attachments/',
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
};

// All allowed types flattened
export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.documents,
];

// File type icons mapping
export const FILE_TYPE_ICONS = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/heic': 'image',
  'application/pdf': 'document-text',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/plain': 'document-text',
  'text/csv': 'grid',
  default: 'attach',
};

// Get icon for file type
export const getFileIcon = (mimeType) => {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS.default;
};

// Check if type is image
export const isImageType = (mimeType) => {
  return ALLOWED_MIME_TYPES.images.includes(mimeType);
};

// Check if type is allowed
export const isAllowedType = (mimeType) => {
  return ALL_ALLOWED_TYPES.includes(mimeType);
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
