import StyledText from '@/components/styledText';
import { colors } from '@/stores/stylesStore';
import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function DetailsPage() {
  const { id } = useLocalSearchParams()
  const txt = `Details screen ${id ?? "And Nothing there"}`
  return (
    <View style={styles.container}>
      <StyledText content={txt}></StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      gap: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg2,
      color: colors.onBg
    },
});