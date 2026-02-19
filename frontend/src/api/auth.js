import { api } from "./client";

export function login(email, password) {
    return api("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function logout() {
    return api("/logout", {
        method: "POST",
    });
}
export function register(email, password, username) {
    return api("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
    });
}
export function getMe() {
    return api("/me", );
}




