import { apiClient } from '../api/client.ts';
import type { UserProfile } from '../types/api.ts';

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'auth_profile';

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
	apiClient.setToken(token);
}

export function clearAuth(): void {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(PROFILE_KEY);
	apiClient.setToken(null);
}

export function getCachedProfile(): UserProfile | null {
	const raw = localStorage.getItem(PROFILE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as UserProfile;
	} catch {
		return null;
	}
}

export function setCachedProfile(profile: UserProfile): void {
	localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function isLoggedIn(): boolean {
	return !!getToken();
}

export async function loadProfile(): Promise<UserProfile | null> {
	const token = getToken();
	if (!token) return null;
	apiClient.setToken(token);

	const cached = getCachedProfile();
	if (cached) return cached;

	try {
		const profile = await apiClient.getProfile();
		setCachedProfile(profile);
		return profile;
	} catch {
		clearAuth();
		return null;
	}
}
