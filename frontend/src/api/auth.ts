import type { MeResponse, LoginResponse, LogoutResponse, RegisterResponse } from "../types/responses/auth";
import { api, unwrapApi } from "./client";
import { emitAuthChanged } from "../utils/authEvents";

export async function login(email: string, password: string): Promise<LoginResponse> {
    const data = await api<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }).then(unwrapApi);
    emitAuthChanged();
    return data;
}

export async function logout(): Promise<LogoutResponse> {
    const data = await api<LogoutResponse>("/logout", {
        method: "POST",
    }).then(unwrapApi);
    emitAuthChanged();
    return data;
}
export async function register(email: string, password: string, username: string, personalDataConsent: boolean): Promise<RegisterResponse> {
    return api<RegisterResponse>("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, username, personal_data_consent: personalDataConsent }),
    }).then(unwrapApi);
}
export async function getMe(): Promise<MeResponse> {
    return api<MeResponse>("/me").then(unwrapApi);
}



