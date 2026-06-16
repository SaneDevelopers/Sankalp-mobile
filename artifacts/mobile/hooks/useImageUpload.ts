import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dttzjuhwp';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sankalp_preset';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const pickAndUploadImage = async (): Promise<string | null> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        if (typeof window !== 'undefined') {
          alert('You need to allow access to your photos to upload an image.');
        } else {
          Alert.alert('Permission Required', 'You need to allow access to your photos to upload an image.');
        }
        return null;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return null;
      }

      setUploading(true);
      const uri = pickerResult.assets[0].uri;

      // Prepare form data
      const data = new FormData();
      
      // On web we can just pass the uri/blob. On native RN we need a file object
      if (typeof window !== 'undefined') {
        // Web platform
        const response = await fetch(uri);
        const blob = await response.blob();
        data.append('file', blob);
      } else {
        // Native platform
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        data.append('file', {
          uri,
          name: filename,
          type,
        } as any);
      }

      data.append('upload_preset', UPLOAD_PRESET);
      data.append('cloud_name', CLOUD_NAME);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error('Cloudinary error response:', errData);
        throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary');
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (typeof window !== 'undefined') {
        alert(error.message || 'Something went wrong during image upload.');
      } else {
        Alert.alert('Upload Failed', error.message || 'Something went wrong during image upload.');
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    pickAndUploadImage,
    uploading,
  };
}
