import { colors } from "@/theme/colors";
import { Text } from "react-native";

type Props = {
    label: string;
    color?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"; 
}

export default function AppText({ label, fontSize = 15, fontWeight = "700", color = colors.onBg }: Props) {
    return (
        <Text style={{
            fontSize: fontSize,
            fontWeight: fontWeight,
            color: color
        }}>
            {label}
        </Text>
    )
}
