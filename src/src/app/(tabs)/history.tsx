import StyledText from '@/components/styledText';
import { colors } from '@/stores/stylesStore';
import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function HistoryPage() {
  const { id } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <StyledText content="History Screen"></StyledText>
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