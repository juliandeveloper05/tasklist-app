/**
 * useFilePicker Hook
 * TaskList App - Phase 2 Attachments
 * 
 * Handles image and document selection with validation
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { 
  STORAGE_CONFIG, 
  ALLOWED_MIME_TYPES, 
  formatFileSize,
  isAllowedType 
} from '../constants/storage';
import { saveFile } from '../utils/fileManager';

export const useFilePicker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Request camera permissions
   */
  const requestCameraPermissions = async () => {
    if (Platform.OS === 'web') return true;
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a la cámara para tomar fotos.'
      );
      return false;
    }
    return true;
  };

  /**
   * Request media library permissions
   */
  const requestMediaPermissions = async () => {
    if (Platform.OS === 'web') return true;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a tus fotos para adjuntar imágenes.'
      );
      return false;
    }
    return true;
  };

  /**
   * Pick image from gallery
   * @param {string} taskId - Task ID to associate attachment with
   * @returns {Promise<Object|null>} Attachment object or null
   */
  const pickImage = useCallback(async (taskId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestMediaPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: STORAGE_CONFIG.IMAGE_QUALITY,
        exif: false,
      });
      
      if (result.canceled) {
        setIsLoading(false);
        return null;
      }
      
      const asset = result.assets[0];
      const filename = asset.fileName || `image_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      
      // Check file size
      if (asset.fileSize && asset.fileSize > STORAGE_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`La imagen excede el límite de ${formatFileSize(STORAGE_CONFIG.MAX_FILE_SIZE)}`);
      }
      
      // Save to local storage
      const attachment = await saveFile(asset.uri, taskId, filename, mimeType);
      
      setIsLoading(false);
      return attachment;
    } catch (err) {
      console.error('Error picking image:', err);
      setError(err.message);
      setIsLoading(false);
      Alert.alert('Error', err.message || 'No se pudo seleccionar la imagen');
      return null;
    }
  }, []);

  /**
   * Take photo with camera
   * @param {string} taskId - Task ID to associate attachment with
   * @returns {Promise<Object|null>} Attachment object or null
   */
  const takePhoto = useCallback(async (taskId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: STORAGE_CONFIG.IMAGE_QUALITY,
        exif: false,
      });
      
      if (result.canceled) {
        setIsLoading(false);
        return null;
      }
      
      const asset = result.assets[0];
      const filename = `photo_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      
      // Save to local storage
      const attachment = await saveFile(asset.uri, taskId, filename, mimeType);
      
      setIsLoading(false);
      return attachment;
    } catch (err) {
      console.error('Error taking photo:', err);
      setError(err.message);
      setIsLoading(false);
      Alert.alert('Error', err.message || 'No se pudo tomar la foto');
      return null;
    }
  }, []);

  /**
   * Pick document from file system
   * @param {string} taskId - Task ID to associate attachment with
   * @returns {Promise<Object|null>} Attachment object or null
   */
  const pickDocument = useCallback(async (taskId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          ...ALLOWED_MIME_TYPES.images,
          ...ALLOWED_MIME_TYPES.documents,
        ],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setIsLoading(false);
        return null;
      }
      
      const file = result.assets[0];
      
      // Validate MIME type
      if (!isAllowedType(file.mimeType)) {
        throw new Error('Tipo de archivo no permitido');
      }
      
      // Check file size
      if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`El archivo excede el límite de ${formatFileSize(STORAGE_CONFIG.MAX_FILE_SIZE)}`);
      }
      
      // Save to local storage
      const attachment = await saveFile(file.uri, taskId, file.name, file.mimeType);
      
      setIsLoading(false);
      return attachment;
    } catch (err) {
      console.error('Error picking document:', err);
      setError(err.message);
      setIsLoading(false);
      Alert.alert('Error', err.message || 'No se pudo seleccionar el documento');
      return null;
    }
  }, []);

  return {
    pickImage,
    takePhoto,
    pickDocument,
    isLoading,
    error,
  };
};

export default useFilePicker;
