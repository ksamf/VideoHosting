import type { MeResponse, LoginResponse, LogoutResponse, RegisterResponse } from "../types/responses/auth";
import { api, unwrapApi } from "./client";

export async function login(email: string, password: string): Promise<LoginResponse> {
    return api<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }).then(unwrapApi);
}

export async function logout(): Promise<LogoutResponse> {
    return api<LogoutResponse>("/logout", {
        method: "POST",
    }).then(unwrapApi);
}
export async function register(email: string, password: string, username: string): Promise<RegisterResponse> {
    return api<RegisterResponse>("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
    }).then(unwrapApi);
}
export async function getMe(): Promise<MeResponse> {
    return api<MeResponse>("/me").then(unwrapApi);
}




