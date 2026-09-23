import { StyleSheet, Text } from 'react-native';
import { colors } from "@/stores/stylesStore"

type Props = {
  content: string;
};

export default function StyledText({ content }: Props) {
  return (
    <Text style={styles.text}>
        {content}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.onBg,
    fontSize: 16,
  },
});
