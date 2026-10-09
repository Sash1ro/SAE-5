import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";

import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import FormField from "@/components/formField";
import ScreenScrollView from "@/components/screenscrollView";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/tokens";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { login, register } from "@/services/userService";
import { saveToken } from "@/services/userTokenService";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const SERVER_ERROR = "Server error, please retry later.";

type AuthResponse = { data?: { token?: string } } | null | undefined;

const validateRegistration = (email: string, pwd: string, confPwd: string): string | null => {
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email.";
  if (pwd.length < 8) return "Password must be at least 8 characters.";
  if (confPwd === "") return "Please confirm your password.";
  if (pwd !== confPwd) return "Passwords do not match.";
  return null;
};

export default function LoginScreen() {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [error, setError] = useState("");

  const { signup } = useLocalSearchParams();
  const accountCreation = signup === "1";
  const router = useRouter();

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isSmallHeight = height < 700;

  const titleSize = isTablet ? 34 : isSmallHeight ? 22 : 28;
  const sectionGap = isSmallHeight ? 24 : 40;
  const formWidth = isLandscape && !isTablet ? "60%" : "85%";
  const formMaxWidth = isTablet ? 420 : 350;
  const inputFontSize = isTablet ? 17 : 16;

  const authenticate = async (
    loadingMessage: string,
    request: () => Promise<AuthResponse>,
    errorByStatus: Record<number, string> = {}
  ) => {
    showLoading(loadingMessage);
    try {
      const res = await request();
      if (res?.data?.token) await saveToken(res.data.token);
      setIsLoggedIn(true);
    } catch (e) {
      const status = axios.isAxiosError(e) ? e.response?.status : undefined;
      setError((status && errorByStatus[status]) || SERVER_ERROR);
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    setError("");

    const cleanEmail = email.trim();
    if (cleanEmail === "") return setError("Please enter your email.");
    if (pwd === "") return setError("Please enter a password.");

    if (!accountCreation) {
      return authenticate("Logging in...", () => login(cleanEmail, pwd), {
        401: "Incorrect email or password.",
      });
    }

    const validationError = validateRegistration(cleanEmail, pwd, confPwd);
    if (validationError) return setError(validationError);

    return authenticate("Creating account...", () => register(cleanEmail, pwd), {
      409: "An account with this email already exists.",
    });
  };

  const toggleMode = () => {
    setError("");
    router.setParams({ signup: accountCreation ? "" : "1" });
  };

  const inputStyle = { fontSize: inputFontSize };

  return (
    <ScreenScrollView
      withKeyboardAvoiding
      minTopPadding={isSmallHeight ? 24 : 40}
      backgroundColor={colors.bg2}
      contentContainerStyle={{ justifyContent: "center", gap: sectionGap }}
    >
      <Text style={[styles.title, { fontSize: titleSize }]}>
        Welcome {!accountCreation ? "Back " : ""}to Manganitor
      </Text>

      <View style={[styles.form, { width: formWidth, maxWidth: formMaxWidth }]}>
        {error !== "" ? <Text style={styles.errorText}>{error}</Text> : null}

        <FormField
          style={inputStyle}
          placeholder="mail@domain.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          label="Email"
          onChangeText={setEmail}
        />

        <FormField
          style={inputStyle}
          placeholder="strong password"
          textContentType="password"
          autoCapitalize="none"
          secureTextEntry
          value={pwd}
          label="Password"
          onChangeText={setPwd}
        />

        {accountCreation && (
          <FormField
            style={inputStyle}
            placeholder="repeat password"
            textContentType="password"
            autoCapitalize="none"
            secureTextEntry
            value={confPwd}
            label="Password confirmation"
            onChangeText={setConfPwd}
          />
        )}

        <ButtonGroup style={styles.buttons}>
          <Button
            label={accountCreation ? "Create" : "Login"}
            fun={handleSubmit}
            icon={accountCreation ? "person-add" : "person"}
          />
          <Button
            alt
            label={accountCreation ? "Back" : "Sign up"}
            fun={toggleMode}
            icon={accountCreation ? "arrow-back" : "person-add"}
          />
        </ButtonGroup>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    color: colors.altText,
    textAlign: "center",
  },
  form: {
    gap: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontWeight: "500",
    marginBottom: -10,
  },
  buttons: {
    marginTop: 10,
  },
});