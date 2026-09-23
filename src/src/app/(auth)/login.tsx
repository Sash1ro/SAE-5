import Button from '@/components/button';
import { colors } from '@/stores/stylesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Alert } from 'react-native';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const { signup } = useLocalSearchParams();
  const accountCreation = signup === "1";
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {!accountCreation ? "Back " : ""}to Manganitor</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder='mail@domain.com'
          placeholderTextColor={colors.placeHolder}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder='strong password'
          placeholderTextColor={colors.placeHolder}
          secureTextEntry
        />

        {accountCreation && (
          <TextInput
            style={styles.input}
            placeholder='repeat password'
            placeholderTextColor={colors.placeHolder}
            secureTextEntry
          />
        )}


        <View style={styles.buttons}>
          {!accountCreation && (<Button label='Login' fun={login}></Button>)}
          {accountCreation && (<Button label='Create' fun={login}></Button>)}
          {!accountCreation && (<Button label='Sign up' fun={() => router.push({ pathname: "/(auth)/login", params: { signup: 1 } })}></Button>)}
          {accountCreation && (<Button label='Login' fun={() => router.push({ pathname: "/(auth)/login"})}></Button>)}
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
    flexDirection: 'row'
  },
});