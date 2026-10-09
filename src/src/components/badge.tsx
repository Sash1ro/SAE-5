import { colors } from "@/theme/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

type Props = { label: string; icon?: keyof typeof Ionicons.glyphMap, color?: string };

export default function Badge({ label, icon = "layers-outline", color = colors.main }: Props) {
    return (
        <View style={[styles.badge, { backgroundColor: color }]}>
            <Ionicons name={icon} size={14} color={colors.onMain} />
            <Text style={[styles.badgeText, { color: colors.onMain }]}>
                {label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "capitalize",
    },
})