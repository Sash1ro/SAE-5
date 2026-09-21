import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert('Permission required', 'Permission to access the media library is required.');
    return null;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  console.log(result);

  if (!result.canceled) {
    return result.assets[0]
  }
  
  return null;
};