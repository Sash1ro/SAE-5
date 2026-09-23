import StyledText from '@/components/styledText';
import { colors } from '@/stores/stylesStore';
import { View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <StyledText content="About screen"></StyledText>
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
});
