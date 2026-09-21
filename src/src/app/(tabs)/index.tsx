import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import ImageViewer from '@/components/image-viewer';
import Button from '@/components/button';

import { pickImage } from '@/utils/pickImage';
import { takePhoto } from '@/utils/takePhoto';

let PlaceholderImage = "https://placehold.net/default.svg";

export default function Index() {
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  
  const handlePickImage = async () => {
    const asset = await pickImage();
    if (asset) {
      setImageAsset(asset);
    }
  };

  const handleTakePhoto = async () => {
    const asset = await takePhoto();
    if (asset) {
      setImageAsset(asset);
    }
  };

  return (
    <View style={styles.container}>
      <ImageViewer imgSource={imageAsset?.uri ?? PlaceholderImage} />
      <View style={styles.bContainer}>
        <Button label='Select Photo' fun={handlePickImage}></Button>
        <Button label='Take Photo' fun={handleTakePhoto}></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bContainer: {
    gap: 10,
    flexDirection: "row",
  }
});
