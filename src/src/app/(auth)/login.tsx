import Button from '@/components/button';
import ButtonGroup from '@/components/buttonGroup';
import ScreenScrollView from '@/components/screenscrollView';
import { colors } from '@/stores/stylesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { login, register, saveToken } from '@/services/userService';
import axios from 'axios';
import { useLoadingStore } from '@/stores/useLoadingStore';

export default function LoginScreen() {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [error, setError] = useState('');
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const { signup } = useLocalSearchParams();
  const accountCreation = signup === "1";
  const router = useRouter();

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isSmallHeight = height < 700;

  const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  const handleSignIn = async (cleanEmail: string) => {
    showLoading("Logging in...")
    try {
      const res = await login(cleanEmail, pwd);

      if (res?.data?.token) {
        await saveToken(res.data.token);
      }

      setIsLoggedIn(true);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Server error, please retry later.");
      }
    } finally {
      hideLoading()
    }
  };

  const handleRegister = async (cleanEmail: string) => {
    if (!EMAIL_REGEX.test(cleanEmail)) return setError("Please enter a valid email.");
    if (pwd.length < 8) return setError("Password must be at least 8 characters.");
    if (confPwd === "") return setError("Please confirm your password.");
    if (pwd !== confPwd) return setError("Passwords do not match.");

    try {
      showLoading("Creating account...")
      const res = await register(cleanEmail, pwd);

      if (res?.data?.token) {
        await saveToken(res.data.token);
      }

      setIsLoggedIn(true);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError("Server error, please retry later.");
      }
    } finally {
      hideLoading()
    }
  };

  const handleSubmit = async () => {
    setError('');

    const cleanEmail = email.trim();

    if (cleanEmail === "") return setError("Please enter your email.");
    if (pwd === "") return setError("Please enter a password.");

    if (accountCreation) {
      await handleRegister(cleanEmail);
    } else {
      await handleSignIn(cleanEmail);
    }
  };


  const dynamicStyles = getDynamicStyles({ isTablet, isLandscape, isSmallHeight });

  return (
    <ScreenScrollView
      withKeyboardAvoiding
      contentContainerStyle={styles.scrollContent}
      minTopPadding={isSmallHeight ? 24 : 40}
    >
      <Text style={[styles.title, dynamicStyles.title]}>
        Welcome {!accountCreation ? "Back " : ""}to Manganitor
      </Text>

      <View style={[styles.formContainer, dynamicStyles.formContainer]}>
        {error !== "" ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder='mail@domain.com'
          placeholderTextColor={colors.placeHolder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder='strong password'
          placeholderTextColor={colors.placeHolder}
          textContentType='password'
          autoCapitalize="none"
          secureTextEntry
          value={pwd}
          onChangeText={setPwd}
        />

        {accountCreation && (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder='repeat password'
            textContentType='password'
            autoCapitalize="none"
            placeholderTextColor={colors.placeHolder}
            secureTextEntry
            value={confPwd}
            onChangeText={setConfPwd}
          />
        )}

        <ButtonGroup style={styles.buttons}>
          <Button
            label={accountCreation ? 'Create' : 'Login'}
            fun={handleSubmit}
            icon={accountCreation ? 'person-add' : 'person'}
          />
          <Button
            alt={true}
            label={accountCreation ? 'Back' : 'Sign up'}
            fun={() => {
              setError('');
              router.setParams({ signup: accountCreation ? "" : "1" });
            }}
            icon={accountCreation ? 'arrow-back' : 'person-add'}
          />
        </ButtonGroup>
      </View>
    </ScreenScrollView>
  );
}

function getDynamicStyles({
  isTablet,
  isLandscape,
  isSmallHeight,
}: {
  isTablet: boolean;
  isLandscape: boolean;
  isSmallHeight: boolean;
}) {
  return {
    title: {
      fontSize: isTablet ? 34 : isSmallHeight ? 22 : 28,
      marginBottom: isSmallHeight ? 24 : 40,
    },
    formContainer: {
      maxWidth: isTablet ? 420 : 350,
      width: isLandscape && !isTablet ? '60%' : '85%',
    },
    input: {
      padding: isSmallHeight ? 12 : 16,
      fontSize: isTablet ? 17 : 16,
    },
  } as const;
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: '700',
    color: colors.altText,
    textAlign: 'center',
  },
  formContainer: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  input: {
    width: '100%',
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.altText,
  },
  buttons: {
    marginTop: 10,
  },
  errorText: {
    color: colors.error,
    width: '100%',
    textAlign: 'left',
    marginBottom: -10,
    fontWeight: '500',
  }
});