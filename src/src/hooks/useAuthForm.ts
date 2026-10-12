import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios, { AxiosResponse } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { login, register } from "@/services/userService";
import { saveToken } from "@/services/userTokenService";
import { useAsyncAction } from "./useAsyncAction";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const MIN_PASSWORD_LENGTH = 8;
const SERVER_ERROR = "Server error, please retry later.";

function validate(isSignup: boolean, email: string, pwd: string, confPwd: string): string | null {
    if (email === "") return "Please enter your email.";
    if (pwd === "") return "Please enter a password.";
    if (!isSignup) return null;

    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email.";
    if (pwd.length < MIN_PASSWORD_LENGTH)
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (confPwd === "") return "Please confirm your password.";
    if (pwd !== confPwd) return "Passwords do not match.";
    return null;
}

function getAuthErrorMessage(error: unknown, errorByStatus: Record<number, string>): string {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return (status && errorByStatus[status]) || SERVER_ERROR;
}

export function useAuthForm() {
    const router = useRouter();
    const run = useAsyncAction();
    const { signup } = useLocalSearchParams<{ signup?: string }>();
    const isSignup = signup === "1";

    const setIsLoggedIn = useAuthStore((s) => s.setIsLoggedIn);

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [confPwd, setConfPwd] = useState("");
    const [error, setError] = useState("");

    const authenticate = async (loadingText: string, request: () => Promise<AxiosResponse>,
        errorByStatus: Record<number, string> = {},) => {
        const ok = await run(
            async () => {
                const res = await request();
                const token = res?.data?.token;
                if (!token) throw new Error("Missing token in auth response");

                await saveToken(token);
                return true;
            },
            {
                loadingText,
                onError: (e) => setError(getAuthErrorMessage(e, errorByStatus)),
            },
        );

        if (ok) setIsLoggedIn(true);
    };

    const submit = async () => {
        setError("");
        const cleanEmail = email.trim();
        const validationError = validate(isSignup, cleanEmail, pwd, confPwd);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (isSignup) {
            await authenticate("Creating account...", () => register(cleanEmail, pwd), {
                409: "An account with this email already exists.",
            });
        } else {
            await authenticate("Logging in...", () => login(cleanEmail, pwd), {
                401: "Incorrect email or password.",
            });
        }
    };

    const toggleMode = () => {
        setError("");
        setConfPwd("");
        router.setParams({ signup: isSignup ? undefined : "1" });
    };

    return {
        isSignup,
        email,
        pwd,
        confPwd,
        error,
        setEmail,
        setPwd,
        setConfPwd,
        submit,
        toggleMode,
    };
}