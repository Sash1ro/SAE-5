import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';


export const takePhoto = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert('Permission required', 'Permission to access the camera is required.');
    return null;
  }

  let result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0];
  }
  
  return null;
};