import { StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import { colors } from "@/stores/stylesStore"
import { useLoadingStore } from '@/stores/useLoadingStore';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    fun?: () => void;
    color?: string,
    icon?: keyof typeof Ionicons.glyphMap;
};

export default function IconButton({ fun, icon, color }: Props) {
    const loading = useLoadingStore((state) => state.isLoading);

    return (
        <Pressable
            onPress={() => fun ? fun() : alert("Pressed")}
            hitSlop={15}
        >
            <Ionicons name={icon} size={24} color={color ? color : colors.placeHolder} />
        </Pressable>

    );
}

