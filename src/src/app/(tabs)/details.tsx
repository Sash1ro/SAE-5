import { colors } from '@/stores/stylesStore';
import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function DetailsPage() {
  const { id } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Text>Details screen {id ?? "And Nothing there"} </Text>
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