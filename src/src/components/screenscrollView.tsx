import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

type Props = {
    children: React.ReactNode;
    withKeyboardAvoiding?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    minTopPadding?: number;
    minBottomPadding?: number;
    backgroundColor?: string;
};

export default function ScreenScrollView({
    children,
    withKeyboardAvoiding = false,
    contentContainerStyle,
    minTopPadding = 24,
    minBottomPadding = 24,
    backgroundColor = colors.background,
}: Props) {
    
    const scroll = (
        <ScrollView
            style={[styles.flexFill, { backgroundColor }]}
            contentContainerStyle={[
                styles.scrollContent,
                {
                    paddingTop: minTopPadding,
                    paddingBottom: minBottomPadding,
                    backgroundColor,
                },
                contentContainerStyle, 
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ScrollView>
    );

    const content = withKeyboardAvoiding ? (
        <KeyboardAvoidingView
            style={[styles.flexFill, { backgroundColor }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {scroll}
        </KeyboardAvoidingView>
    ) : (
        scroll
    );

    return (
        <SafeAreaView style={[styles.flexFill, { backgroundColor }]} edges={['top', 'bottom']}>
            {content}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flexFill: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
});