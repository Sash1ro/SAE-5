import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function DetailsPage() {
  const { id } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Details screen {id ?? "And Nothing there"} </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#25292e',
  },
});