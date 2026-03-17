export function validateLogin(value: string): string | null {
	const v = value.trim();
	if (!v) return 'Login is required.';
	if (v.length < 3) return 'Login must be at least 3 characters.';
	if (!/^[a-zA-Z]/.test(v)) return 'Login must start with a letter.';
	if (!/^[a-zA-Z]+$/.test(v)) return 'Login can only contain English letters.';
	return null;
}

export function validatePassword(value: string): string | null {
	if (!value) return 'Password is required.';
	if (value.length < 6) return 'Password must be at least 6 characters.';
	if (!/[^a-zA-Z0-9]/.test(value)) return 'Password must contain at least 1 special character.';
	return null;
}

export function validateName(value: string): string | null {
	const v = value.trim();
	if (!v) return 'Name is required.';
	if (v.length < 3) return 'Name must be at least 3 characters.';
	if (!/^[a-zA-Z]+$/.test(v)) return 'Name can only contain English letters.';
	return null;
}

export function validateEmail(value: string): string | null {
	const v = value.trim();
	if (!v) return 'Email is required.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
	return null;
}

export function validateConfirmPassword(value: string, password: string): string | null {
	if (!value) return 'Please confirm your password.';
	if (value !== password) return 'Passwords do not match.';
	return null;
}
