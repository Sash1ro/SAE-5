import { StyleSheet, View } from 'react-native';

import ImageViewer from '@/components/image-viewer';
import Button from '@/components/button';

let PlaceholderImage = "https://placehold.net/default.svg";

export default function Index() {
  return (
    <View style={styles.container}>
      <ImageViewer imgSource={PlaceholderImage} />
      <View style={styles.bContainer}>
        <Button label='Select Photo' fun={function () {
          alert("tested 1")
        }}></Button>
        <Button label='Take Photo' fun={function () {
          alert("tested 2")
        }}></Button>
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
