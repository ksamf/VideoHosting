import type { User } from "../user";

export interface LoginResponse {
    message: string;
}

export interface LogoutResponse {
    message: string;
}

export interface RegisterResponse {
    message: string;
}

export interface MeResponse extends Pick<User, "user_id" | "username" | "avatar_url"> {}
