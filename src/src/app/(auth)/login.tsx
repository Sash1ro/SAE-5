import Button from '@/components/button';
import ButtonGroup from '@/components/buttonGroup';
import ScreenScrollView from '@/components/screenscrollView';
import { colors } from '@/stores/stylesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { login } from '@/services/userService';

export default function LoginScreen() {
  const loginState = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [error, setError] = useState('');

  const { signup } = useLocalSearchParams();
  const accountCreation = signup === "1";
  const router = useRouter();

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isSmallHeight = height < 700;

  const handleLogin = async () => {
    setError('');

    if (email.trim() === "") {
      return setError("Please enter your email.");
    }
    if (pwd === "") {
      return setError("Please enter a password.");
    }

    if (accountCreation) {
      const validEmail: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      if(!validEmail.test(email)) {
        return setError("Please enter a valid email.")
      }

      if (confPwd === "") {
        return setError("Please confirm your password.");
      }
      if (pwd !== confPwd) {
        return setError("Passwords do not match.");
      }
      if(pwd.length < 8) {
        return setError("Password must be at least 8 characters.")
      }
    } else {
      try {
        await login(email.trim(), pwd)
      } catch (e) {
        return setError("Email or password incorrect")
      }
      
    }

    loginState();
  }

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
            fun={handleLogin}
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