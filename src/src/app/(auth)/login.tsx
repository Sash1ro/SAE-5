import Button from '@/components/button';
import { colors } from '@/stores/stylesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TextInput } from 'react-native';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [error, setError] = useState('');

  const { signup } = useLocalSearchParams();
  const accountCreation = signup === "1";
  const router = useRouter();

  const handleLogin = () => {
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
    }

    login();
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Welcome {!accountCreation ? "Back " : ""}to Manganitor
      </Text>

      <View style={styles.formContainer}>
        {error !== "" ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder='mail@domain.com'
          placeholderTextColor={colors.placeHolder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
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
            style={styles.input}
            placeholder='repeat password'
            textContentType='password'
            autoCapitalize="none"
            placeholderTextColor={colors.placeHolder}
            secureTextEntry
            value={confPwd}
            onChangeText={setConfPwd}
          />
        )}

        <View style={styles.buttons}>
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.altText,
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 350,
    gap: 16,
  },
  input: {
    width: '100%',
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.altText,
  },
  buttons: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
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