// app/login.tsx
import { StyleSheet, Text, View } from "react-native";
import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import FormField from "@/components/formField";
import ScreenScrollView from "@/components/screenscrollView";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/tokens";
import { useAuthForm } from "@/hooks/useAuthForm";

export default function LoginScreen() {
  const {
    isSignup, email, pwd, confPwd, error,
    setEmail, setPwd, setConfPwd, submit, toggleMode,
  } = useAuthForm();

  return (
    <ScreenScrollView
      withKeyboardAvoiding
      minTopPadding={spacing.lg}
      backgroundColor={colors.bg2}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Welcome {isSignup ? "" : "Back "}to Manganitor
      </Text>

      <View style={styles.form}>
        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        <FormField
          label="Email"
          placeholder="mail@domain.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <FormField
          label="Password"
          placeholder="strong password"
          value={pwd}
          onChangeText={setPwd}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isSignup ? "new-password" : "current-password"}
          textContentType={isSignup ? "newPassword" : "password"}
        />

        {isSignup && (
          <FormField
            label="Password confirmation"
            placeholder="repeat password"
            value={confPwd}
            onChangeText={setConfPwd}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}

        <ButtonGroup style={styles.buttons}>
          <Button
            label={isSignup ? "Create" : "Login"}
            fun={submit}
            icon={isSignup ? "person-add" : "person"}
          />
          <Button
            alt
            label={isSignup ? "Back" : "Sign up"}
            fun={toggleMode}
            icon={isSignup ? "arrow-back" : "person-add"}
          />
        </ButtonGroup>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl, 
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.altText,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    gap: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontWeight: "500",
  },
  buttons: {
    marginTop: spacing.sm,
  },
});