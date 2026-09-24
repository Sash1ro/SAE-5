import { Platform, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import ImageViewer from '@/components/imageViewer';
import Button from '@/components/button';
import CustomSlider from '@/components/slider';

import { pickImage } from '@/utils/pickImage';
import { takePhoto } from '@/utils/takePhoto';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { colors, container } from '@/stores/stylesStore';

export default function Index() {
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [sliderValue, setSliderValue] = useState(0.2);
  const imageLoaded = imageAsset && typeof imageAsset === 'object' && 'uri' in imageAsset;
  const isMobile = Platform.OS === "ios" || Platform.OS === "android"
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
      <ImageViewer imgSource={imageAsset?.uri ?? null} />
      {imageLoaded && (
        <View style={styles.sliderContainer}>
          <CustomSlider
            label="Confidence level"
            value={sliderValue}
            step={0.05}
            onValueChange={setSliderValue}
          />
        </View>
      )}
      <View style={styles.bContainer}>
        {!imageLoaded && (<Button label='Select Images' fun={handlePickImage} icon={'images'}></Button>)}
        {!imageLoaded && isMobile && (<Button label='Take Photo' fun={handleTakePhoto} icon={'aperture'}></Button>)}
        {imageLoaded && (<Button label='Remove Photo' fun={handleRemove} icon={'trash-bin'} danger={true}></Button>)}
        {imageLoaded && (<Button label='Fetch data' icon={'search'}></Button>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...container,
  bContainer: {
    gap: 10,
    flexDirection: "row",
  },
  sliderContainer: {
    width: '80%',
    maxWidth: 320,
    marginVertical: 0,
  }
});
