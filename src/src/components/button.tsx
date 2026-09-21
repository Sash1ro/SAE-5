import { StyleSheet, View, Pressable, Text } from 'react-native';
import { colors } from "@/stores/stylesStore"

type Props = {
  label: string;
  fun: Function
};

export default function Button({ label, fun }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => fun ? fun() : alert("Pressed")}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width:  190,
    height: 48,
    borderRadius: 60,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    backgroundColor: colors.main
  },
  button: {
    borderRadius: 60,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
