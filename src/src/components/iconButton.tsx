import { StyleSheet, Pressable} from 'react-native';
import { colors } from "@/theme/colors"
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    fun?: () => void;
    color?: string,
    icon?: keyof typeof Ionicons.glyphMap;
};

export default function IconButton({ fun, icon, color }: Props) {
    return (
        <Pressable
            onPress={() => fun ? fun() : alert("Pressed")}
            hitSlop={15}
        >
            <Ionicons name={icon} size={24} color={color ? color : colors.placeHolder} />
        </Pressable>

    );
}

