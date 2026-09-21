import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  const { id } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Text style={styles.text}>History screen</Text>
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