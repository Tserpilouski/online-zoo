import './style.scss';
import { apiClient } from '../../api/client.ts';
import { isLoggedIn } from '../../auth/user.ts';
import { initHeaderUser } from '../../auth/header-user.ts';
import {
	validateLogin,
	validatePassword,
	validateName,
	validateEmail,
	validateConfirmPassword,
} from '../../auth/validation.ts';

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

const nameInput = document.getElementById('name') as HTMLInputElement;
const loginInput = document.getElementById('login') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const confirmInput = document.getElementById('confirm-password') as HTMLInputElement;
const submitBtn = document.getElementById('registration-submit') as HTMLButtonElement;
const formErrorEl = document.getElementById('registration-error');

const validity = {
	name: false,
	login: false,
	email: false,
	password: false,
	confirmPassword: false,
};

let confirmTouched = false;

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
	submitBtn.disabled = !Object.values(validity).every(Boolean);
}

nameInput.addEventListener('blur', () => {
	const err = validateName(nameInput.value);
	validity.name = !err;
	showFieldError(nameInput, 'name-error', err);
	updateSubmitState();
});
nameInput.addEventListener('focus', () => clearFieldError(nameInput, 'name-error'));
nameInput.addEventListener('input', () => {
	validity.name = !validateName(nameInput.value);
	updateSubmitState();
});

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

emailInput.addEventListener('blur', () => {
	const err = validateEmail(emailInput.value);
	validity.email = !err;
	showFieldError(emailInput, 'email-error', err);
	updateSubmitState();
});
emailInput.addEventListener('focus', () => clearFieldError(emailInput, 'email-error'));
emailInput.addEventListener('input', () => {
	validity.email = !validateEmail(emailInput.value);
	updateSubmitState();
});

passwordInput.addEventListener('blur', () => {
	const err = validatePassword(passwordInput.value);
	validity.password = !err;
	showFieldError(passwordInput, 'password-error', err);
	if (confirmTouched) {
		const confirmErr = validateConfirmPassword(confirmInput.value, passwordInput.value);
		validity.confirmPassword = !confirmErr;
		showFieldError(confirmInput, 'confirm-password-error', confirmErr);
	}
	updateSubmitState();
});
passwordInput.addEventListener('focus', () => clearFieldError(passwordInput, 'password-error'));
passwordInput.addEventListener('input', () => {
	validity.password = !validatePassword(passwordInput.value);
	if (confirmTouched) {
		const confirmErr = validateConfirmPassword(confirmInput.value, passwordInput.value);
		validity.confirmPassword = !confirmErr;
		showFieldError(confirmInput, 'confirm-password-error', confirmErr);
	}
	updateSubmitState();
});

confirmInput.addEventListener('blur', () => {
	confirmTouched = true;
	const err = validateConfirmPassword(confirmInput.value, passwordInput.value);
	validity.confirmPassword = !err;
	showFieldError(confirmInput, 'confirm-password-error', err);
	updateSubmitState();
});
confirmInput.addEventListener('focus', () => clearFieldError(confirmInput, 'confirm-password-error'));
confirmInput.addEventListener('input', () => {
	validity.confirmPassword = !validateConfirmPassword(confirmInput.value, passwordInput.value);
	updateSubmitState();
});

const form = document.getElementById('registration-form') as HTMLFormElement;
form.addEventListener('submit', async (e) => {
	e.preventDefault();
	if (formErrorEl) formErrorEl.textContent = '';
	submitBtn.disabled = true;

	try {
		await apiClient.register({
			name: nameInput.value.trim(),
			login: loginInput.value.trim(),
			email: emailInput.value.trim(),
			password: passwordInput.value,
		});
		window.location.href = '../sign-in/index.html';
	} catch (err) {
		const isConflict = err instanceof Error && err.message.includes('409');
		if (formErrorEl) {
			formErrorEl.textContent = isConflict ? 'Login or email is already taken.' : 'Registration failed. Please try again.';
		}
		updateSubmitState();
	}
});
