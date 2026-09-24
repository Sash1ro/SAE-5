import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/stores/stylesStore';

type Props = {
  imgSource: ImageSourcePropType | string | null;
};

export default function ImageViewer({ imgSource }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="image-outline" size={64} color={colors.placeHolder} />
      </View>

      {imgSource !== "" && imgSource !== null && (
        <Image
          source={imgSource}
          style={styles.image}
          contentFit="cover"
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 440,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});