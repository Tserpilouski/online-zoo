import './style.scss';
import { apiClient } from '../../api/client.ts';
import { storeToken, setCachedProfile, isLoggedIn } from '../../auth/user.ts';
import { initHeaderUser } from '../../auth/header-user.ts';
import { validateLogin, validatePassword } from '../../auth/validation.ts';

if (isLoggedIn()) {
	window.location.href = '../landing/index.html';
}

const burgerBtn = document.getElementById('header-burger');
const mobileMenu = document.getElementById('header-mobile-menu');
const mobileClose = document.getElementById('header-mobile-close');

if (burgerBtn && mobileMenu && mobileClose) {
	burgerBtn.addEventListener('click', () => {
		mobileMenu.classList.add('header__mobile-menu--open');
		document.body.style.overflow = 'hidden';
	});
	mobileClose.addEventListener('click', () => {
		mobileMenu.classList.remove('header__mobile-menu--open');
		document.body.style.overflow = '';
	});
}

initHeaderUser();

const loginInput = document.getElementById('login') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const submitBtn = document.getElementById('sign-in-submit') as HTMLButtonElement;
const formErrorEl = document.getElementById('sign-in-error');

const validity = { login: false, password: false };

function getIcon(input: HTMLInputElement): HTMLElement | null {
	return input.parentElement?.querySelector<HTMLElement>('.auth__input-icon') ?? null;
}

function showFieldError(input: HTMLInputElement, errorId: string, message: string | null): void {
	const errorP = document.getElementById(errorId);
	const icon = getIcon(input);
	if (message) {
		input.classList.add('auth__input--error');
		if (errorP) errorP.textContent = message;
		if (icon) icon.style.display = 'flex';
	} else {
		input.classList.remove('auth__input--error');
		if (errorP) errorP.textContent = '';
		if (icon) icon.style.display = 'none';
	}
}

function clearFieldError(input: HTMLInputElement, errorId: string): void {
	input.classList.remove('auth__input--error');
	const errorP = document.getElementById(errorId);
	if (errorP) errorP.textContent = '';
	const icon = getIcon(input);
	if (icon) icon.style.display = 'none';
}

function updateSubmitState(): void {
	submitBtn.disabled = !(validity.login && validity.password);
}

loginInput.addEventListener('blur', () => {
	const err = validateLogin(loginInput.value);
	validity.login = !err;
	showFieldError(loginInput, 'login-error', err);
	updateSubmitState();
});
loginInput.addEventListener('focus', () => clearFieldError(loginInput, 'login-error'));
loginInput.addEventListener('input', () => {
	validity.login = !validateLogin(loginInput.value);
	updateSubmitState();
});

passwordInput.addEventListener('blur', () => {
	const err = validatePassword(passwordInput.value);
	validity.password = !err;
	showFieldError(passwordInput, 'password-error', err);
	updateSubmitState();
});
passwordInput.addEventListener('focus', () => clearFieldError(passwordInput, 'password-error'));
passwordInput.addEventListener('input', () => {
	validity.password = !validatePassword(passwordInput.value);
	updateSubmitState();
});

const form = document.getElementById('sign-in-form') as HTMLFormElement;
form.addEventListener('submit', async (e) => {
	e.preventDefault();
	if (formErrorEl) formErrorEl.textContent = '';
	submitBtn.disabled = true;

	try {
		const response = await apiClient.login({
			login: loginInput.value.trim(),
			password: passwordInput.value,
		});
		storeToken(response.token);
		const profile = await apiClient.getProfile();
		setCachedProfile(profile);
		window.location.href = '../landing/index.html';
	} catch {
		if (formErrorEl) formErrorEl.textContent = 'Incorrect login or password.';
		updateSubmitState();
	}
});
