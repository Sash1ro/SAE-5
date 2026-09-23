import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { colors } from '@/stores/stylesStore'; // using your existing colors

export default function GlobalLoader() {
  const { isLoading, message } = useLoadingStore();
  if (!isLoading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.main || '#fff'} />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, 
    elevation: 9999,
  },
  box: {
    backgroundColor: colors.bg2,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.altText,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  }
});