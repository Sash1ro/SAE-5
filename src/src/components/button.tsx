import { StyleSheet, View, Pressable, Text } from 'react-native';
import { colors } from "@/stores/stylesStore"
import { useLoadingStore } from '@/stores/useLoadingStore';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  label?: string;
  fun?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  alt?: boolean;
  danger?: boolean;
};

export default function Button({ label, fun, icon, alt, danger }: Props) {
  const loading = useLoadingStore((state) => state.isLoading);
  const currentBgColor = alt ? colors.second : danger ? colors.error : colors.main;
  const currentTextColor = alt ? colors.onMain : colors.onMain;

  return (
    <View style={[styles.buttonContainer, { backgroundColor: currentBgColor }]}>
      <Pressable
        disabled={loading}
        style={styles.button}
        onPress={() => fun ? fun() : alert("Pressed")}
      >
        {icon && (
          <Ionicons name={icon} size={20} color={currentTextColor} />
        )}
        {label && (
          <Text
            style={[styles.buttonLabel, { color: currentTextColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    minWidth: 100,
    height: 48,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 60,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});