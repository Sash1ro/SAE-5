import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import ImageViewer from '@/components/image-viewer';
import Button from '@/components/button';

import { pickImage } from '@/utils/pickImage';
import { takePhoto } from '@/utils/takePhoto';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { colors } from '@/stores/stylesStore';

let PlaceholderImage = "https://placehold.net/4.png";

export default function Index() {
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const imageLoaded = imageAsset && typeof imageAsset === 'object' && 'uri' in imageAsset;
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const handlePickImage = async () => {
    showLoading("Loading image...")
    try {
      const asset = await pickImage();
      if (asset) {
       setImageAsset(asset);
      }
    } catch (error) {
      console.log(error)
    } finally {
      hideLoading()
    }
  };

  const handleTakePhoto = async () => {
    showLoading("Loading photo...")
    try {
      const asset = await takePhoto();
      if (asset) {
       setImageAsset(asset);
      }
    } catch (error) {
      console.log(error)
    } finally {
      hideLoading()
    }
  };

  const handleRemove = () => setImageAsset(null);

  return (
    <View style={styles.container}>
      <ImageViewer imgSource={imageAsset?.uri ?? PlaceholderImage} />
      <View style={styles.bContainer}>
        {!imageLoaded && (<Button label='Select Photo' fun={handlePickImage}></Button>)}
        {!imageLoaded && (<Button label='Take Photo' fun={handleTakePhoto}></Button>)}
        {imageLoaded && (<Button label='Remove Photo' fun={handleRemove}></Button>)}
        {imageLoaded && (<Button label='Fetch data' fun={() => null}></Button>)}
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
    backgroundColor: colors.bg2
  },
  bContainer: {
    gap: 10,
    flexDirection: "row",
  }
});
