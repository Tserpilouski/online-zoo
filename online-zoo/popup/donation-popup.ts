import type { Pet } from '../types/api.ts';
import { apiClient } from '../api/client.ts';
import { getToken } from '../auth/user.ts';

const ARROW_SVG = `<svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd"
		d="M13.2098 0.119971C13.0277 0.199174 12.8622 0.315255 12.7229 0.461565C12.5833 0.607505 12.4725 0.780876 12.397 0.971748C12.3214 1.16262 12.2825 1.36724 12.2825 1.57389C12.2825 1.78055 12.3214 1.98517 12.397 2.17604C12.4725 2.36691 12.5833 2.54028 12.7229 2.68622L18.7506 9H1.6C1.17565 9 0.768688 9.21071 0.468629 9.58579C0.168571 9.96086 0 10.4696 0 11C0 11.5304 0.168571 12.0391 0.468629 12.4142C0.768688 12.7893 1.17565 13 1.6 13H18.7514L12.7229 19.3146C12.4414 19.6096 12.2833 20.0097 12.2833 20.4269C12.2833 20.8441 12.4414 21.2443 12.7229 21.5393C13.0045 21.8343 13.3863 22 13.7845 22C14.1826 22 14.5645 21.8343 14.846 21.5393L23.842 12.1127C23.9816 11.9668 24.0924 11.7934 24.168 11.6026C24.2436 11.4117 24.2825 11.2071 24.2825 11.0004C24.2825 10.7938 24.2436 10.5891 24.168 10.3983C24.0924 10.2074 23.9816 10.034 23.842 9.88808L14.846 0.461565C14.7067 0.315255 14.5413 0.199174 14.3591 0.119971C14.177 0.0407677 13.9817 0 13.7845 0C13.5873 0 13.392 0.0407677 13.2098 0.119971Z"
		fill="white" />
</svg>`;

const CHEVRON_SVG = `<svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M1 1L7 7L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PRESET_AMOUNTS = [10, 20, 30, 50, 80, 100];

function showError(id: string, message: string): void {
	const el = document.getElementById(id);
	if (!el) return;
	el.textContent = message;
	el.style.display = 'block';
	const input = el.previousElementSibling as HTMLElement | null;
	input?.classList.add('donation-popup__input--error');
}

function clearError(id: string): void {
	const el = document.getElementById(id);
	if (!el) return;
	el.textContent = '';
	el.style.display = 'none';
	const input = el.previousElementSibling as HTMLElement | null;
	input?.classList.remove('donation-popup__input--error');
}

const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear + i);

interface State {
	step: 1 | 2 | 3;
	// step 1
	amount: number | null;
	petId: number | null;
	recurring: boolean;
	selectedPreset: number | null;
	// step 2
	name: string;
	email: string;
}

const state: State = {
	step: 1,
	amount: null,
	petId: null,
	recurring: false,
	selectedPreset: null,
	name: '',
	email: '',
};

function stepDots(active: number): string {
	return [1, 2, 3]
		.map(
			(n) =>
				`<span class="donation-popup__step-dot${n <= active ? ' donation-popup__step-dot--active' : ''}"></span>`,
		)
		.join('');
}

function renderStep1(popup: Element, pets: Pet[]): void {
	popup.innerHTML = `
		<div class="donation-popup__header">
			<h2 class="donation-popup__title">Make Your Donation</h2>
		</div>
		<div class="donation-popup__body">
			<p class="donation-popup__section-label">Donation Information:</p>
			<hr class="donation-popup__divider" />

			<div class="donation-popup__amounts">
				<p class="donation-popup__amounts-label"><span>*</span> Choose your donation amount:</p>
				<div class="donation-popup__amounts-grid">
					${PRESET_AMOUNTS.map(
						(a) =>
							`<button class="donation-popup__amount-btn${state.selectedPreset === a ? ' donation-popup__amount-btn--active' : ''}" data-amount="${a}">$${a}</button>`,
					).join('')}
				</div>
			</div>

			<div class="donation-popup__row">
				<span class="donation-popup__row-btn">Other Amount</span>
				<input
					type="number"
					id="donation-custom-amount"
					class="donation-popup__input"
					min="1"
					placeholder=""
					value="${state.selectedPreset === null && state.amount ? state.amount : ''}" />
			</div>

			<div class="donation-popup__row">
				<span class="donation-popup__row-btn">For Special Pet</span>
				<select id="donation-pet-select" class="donation-popup__select">
					<option value="" disabled ${state.petId === null ? 'selected' : ''}>Choose your favourite</option>
					${pets.map((p) => `<option value="${p.id}" ${state.petId === p.id ? 'selected' : ''}>${p.name}${p.commonName ? ` the ${p.commonName}` : ''}</option>`).join('')}
				</select>
			</div>

			<label class="donation-popup__checkbox-row">
				<input type="checkbox" id="donation-recurring" class="donation-popup__checkbox" ${state.recurring ? 'checked' : ''} />
				<span class="donation-popup__checkbox-label">Make this a monthly recurring gift</span>
			</label>

			<div class="donation-popup__footer">
				<div class="donation-popup__steps">${stepDots(1)}</div>
				<button class="donation-popup__next-btn" id="donation-next-btn">
					Next ${ARROW_SVG}
				</button>
			</div>
		</div>
	`;

	const amountBtns = popup.querySelectorAll<HTMLButtonElement>('.donation-popup__amount-btn');
	const customInput = popup.querySelector<HTMLInputElement>('#donation-custom-amount');

	amountBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			amountBtns.forEach((b) => b.classList.remove('donation-popup__amount-btn--active'));
			btn.classList.add('donation-popup__amount-btn--active');
			state.selectedPreset = Number(btn.dataset.amount);
			state.amount = state.selectedPreset;
			if (customInput) customInput.value = '';
		});
	});

	customInput?.addEventListener('input', () => {
		amountBtns.forEach((b) => b.classList.remove('donation-popup__amount-btn--active'));
		state.selectedPreset = null;
		state.amount = customInput.value ? Number(customInput.value) : null;
	});

	popup.querySelector<HTMLButtonElement>('#donation-next-btn')?.addEventListener('click', () => {
		if (!state.amount || state.amount <= 0) {
			alert('Please choose or enter a donation amount.');
			return;
		}
		const petSelect = popup.querySelector<HTMLSelectElement>('#donation-pet-select');
		const recurringCheck = popup.querySelector<HTMLInputElement>('#donation-recurring');
		state.petId = petSelect?.value ? Number(petSelect.value) : null;
		state.recurring = recurringCheck?.checked ?? false;
		state.step = 2;
		renderStep2(popup, pets);
	});
}

function renderStep2(popup: Element, pets: Pet[]): void {
	popup.innerHTML = `
		<div class="donation-popup__header">
			<h2 class="donation-popup__title">Make Your Donation</h2>
		</div>
		<div class="donation-popup__body">
			<p class="donation-popup__section-label">Billing Information:</p>
			<hr class="donation-popup__divider" />

			<div class="donation-popup__field">
				<label class="donation-popup__field-label" for="donation-name">
					<span>*</span> Your Name
				</label>
				<input
					type="text"
					id="donation-name"
					class="donation-popup__input donation-popup__input--full"
					placeholder="First and last name"
					value="${state.name}" />
				<span class="donation-popup__error" id="error-name"></span>
			</div>

			<div class="donation-popup__field">
				<label class="donation-popup__field-label" for="donation-email">
					<span>*</span> Your Email Address
				</label>
				<input
					type="email"
					id="donation-email"
					class="donation-popup__input donation-popup__input--full"
					placeholder="Enter your email"
					value="${state.email}" />
				<span class="donation-popup__error" id="error-email"></span>
				<p class="donation-popup__field-hint">
					You will receive emails from the Online Zoo, including updates and news on
					the latest discoveries and translations. You can unsubscribe at any time.
				</p>
			</div>

			<div class="donation-popup__footer">
				<div class="donation-popup__steps">${stepDots(2)}</div>
				<button class="donation-popup__back-btn" id="donation-back-btn">Back</button>
				<button class="donation-popup__next-btn" id="donation-next-btn">
					Next ${ARROW_SVG}
				</button>
			</div>
		</div>
	`;

	popup.querySelector<HTMLButtonElement>('#donation-back-btn')?.addEventListener('click', () => {
		state.step = 1;
		renderStep1(popup, pets);
	});

	popup.querySelector<HTMLButtonElement>('#donation-next-btn')?.addEventListener('click', () => {
		const nameInput = popup.querySelector<HTMLInputElement>('#donation-name');
		const emailInput = popup.querySelector<HTMLInputElement>('#donation-email');

		const name = nameInput?.value.trim() ?? '';
		const email = emailInput?.value.trim() ?? '';

		clearError('error-name');
		clearError('error-email');

		let hasError = false;
		if (!name) {
			showError('error-name', 'Please enter your full name.');
			hasError = true;
		}
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			showError('error-email', 'Please enter a valid email address.');
			hasError = true;
		}
		if (hasError) return;

		state.name = name;
		state.email = email;
		state.step = 3;
		renderStep3(popup, pets);
	});

	popup.querySelector<HTMLInputElement>('#donation-name')?.addEventListener('input', () => clearError('error-name'));
	popup.querySelector<HTMLInputElement>('#donation-email')?.addEventListener('input', () => clearError('error-email'));
}

function renderStep3(popup: Element, pets: Pet[]): void {
	popup.innerHTML = `
		<div class="donation-popup__header">
			<h2 class="donation-popup__title">Make Your Donation</h2>
		</div>
		<div class="donation-popup__body">
			<p class="donation-popup__section-label">Payment Information:</p>
			<hr class="donation-popup__divider" />

			<div class="donation-popup__payment-row">
				<div class="donation-popup__field donation-popup__field--grow">
					<label class="donation-popup__field-label donation-popup__field-label--teal" for="donation-card">
						<span>*</span> Credit Card Number
					</label>
					<input
						type="text"
						id="donation-card"
						class="donation-popup__input donation-popup__input--full"
						maxlength="19"
						placeholder="" />
					<span class="donation-popup__error" id="error-card"></span>
				</div>
				<div class="donation-popup__field donation-popup__field--shrink">
					<label class="donation-popup__field-label donation-popup__field-label--teal" for="donation-cvv">
						<span>*</span> CVV Number
					</label>
					<input
						type="text"
						id="donation-cvv"
						class="donation-popup__input donation-popup__input--full"
						maxlength="4"
						placeholder="" />
					<span class="donation-popup__error" id="error-cvv"></span>
				</div>
			</div>

			<div class="donation-popup__field">
				<label class="donation-popup__field-label donation-popup__field-label--teal">
					<span>*</span> Expiration Date
				</label>
				<div class="donation-popup__expiry-row">
					<div class="donation-popup__select-wrap">
						<select id="donation-month" class="donation-popup__select--expiry">
							<option value="" disabled selected>Month</option>
							${MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
						</select>
						<span class="donation-popup__select-chevron">${CHEVRON_SVG}</span>
					</div>
					<div class="donation-popup__select-wrap">
						<select id="donation-year" class="donation-popup__select--expiry">
							<option value="" disabled selected>Year</option>
							${YEARS.map((y) => `<option value="${y}">${y}</option>`).join('')}
						</select>
						<span class="donation-popup__select-chevron">${CHEVRON_SVG}</span>
					</div>
				</div>
				<span class="donation-popup__error" id="error-expiry"></span>
			</div>

			<div class="donation-popup__footer">
				<div class="donation-popup__steps">${stepDots(3)}</div>
				<button class="donation-popup__back-btn" id="donation-back-btn">Back</button>
				<button class="donation-popup__complete-btn" id="donation-complete-btn">
					Complete Donation ${ARROW_SVG}
				</button>
			</div>
		</div>
	`;

	popup.querySelector<HTMLButtonElement>('#donation-back-btn')?.addEventListener('click', () => {
		state.step = 2;
		renderStep2(popup, pets);
	});

	popup.querySelector<HTMLButtonElement>('#donation-complete-btn')?.addEventListener('click', async () => {
		const cardInput = popup.querySelector<HTMLInputElement>('#donation-card');
		const cvvInput = popup.querySelector<HTMLInputElement>('#donation-cvv');
		const monthSelect = popup.querySelector<HTMLSelectElement>('#donation-month');
		const yearSelect = popup.querySelector<HTMLSelectElement>('#donation-year');
		const completeBtn = popup.querySelector<HTMLButtonElement>('#donation-complete-btn');

		const card = cardInput?.value.replace(/\s/g, '') ?? '';
		const cvv = cvvInput?.value ?? '';
		const month = monthSelect?.value ?? '';
		const year = yearSelect?.value ?? '';

		clearError('error-card');
		clearError('error-cvv');
		clearError('error-expiry');

		let hasError = false;

		if (card.length < 13) {
			showError('error-card', 'Please enter a valid credit card number.');
			hasError = true;
		}
		if (cvv.length < 3) {
			showError('error-cvv', 'Please enter a valid CVV (3–4 digits).');
			hasError = true;
		}
		if (!month || !year) {
			showError('error-expiry', 'Please select expiration month and year.');
			hasError = true;
		}
		if (hasError) return;

		if (completeBtn) {
			completeBtn.disabled = true;
			completeBtn.textContent = 'Processing...';
		}

		try {
			const token = getToken();
			if (token) apiClient.setToken(token);

			await apiClient.createDonation({
				name: state.name,
				email: state.email,
				amount: state.amount!,
				petId: state.petId ?? 0,
			});

			popup.innerHTML = `
				<div class="donation-popup__header">
					<h2 class="donation-popup__title">Make Your Donation</h2>
				</div>
				<div class="donation-popup__body donation-popup__body--success">
					<p class="donation-popup__success-text">Thank you for your donation of <strong>$${state.amount}</strong>!</p>
					<p class="donation-popup__success-sub">A confirmation has been sent to ${state.email}.</p>
					<button class="donation-popup__complete-btn" id="donation-close-btn">
						Close
					</button>
				</div>
			`;
			popup.querySelector('#donation-close-btn')?.addEventListener('click', closePopup);
		} catch {
			if (completeBtn) {
				completeBtn.disabled = false;
				completeBtn.innerHTML = `Complete Donation ${ARROW_SVG}`;
			}
			alert('Something went wrong. Please try again.');
		}
	});

	// Format card number with spaces every 4 digits
	const cardInput = popup.querySelector<HTMLInputElement>('#donation-card');
	cardInput?.addEventListener('input', () => {
		const digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
		cardInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
		clearError('error-card');
	});

	popup.querySelector<HTMLInputElement>('#donation-cvv')?.addEventListener('input', () => clearError('error-cvv'));
	popup.querySelector<HTMLSelectElement>('#donation-month')?.addEventListener('change', () => clearError('error-expiry'));
	popup.querySelector<HTMLSelectElement>('#donation-year')?.addEventListener('change', () => clearError('error-expiry'));
}

export function initDonationPopup(pets: Pet[] = []): void {
	const overlay = document.getElementById('donation-popup-overlay');
	if (!overlay) return;

	const popup = overlay.querySelector('.donation-popup');
	if (!popup) return;

	Object.assign(state, {
		step: 1, amount: null, petId: null, recurring: false,
		selectedPreset: null, name: '', email: '',
	});
	renderStep1(popup, pets);

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) closePopup();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closePopup();
	});
}

export function openPopup(): void {
	const overlay = document.getElementById('donation-popup-overlay');
	if (!overlay) return;
	overlay.classList.add('popup-overlay--open');
	document.body.style.overflow = 'hidden';
}

export function closePopup(): void {
	document.getElementById('donation-popup-overlay')?.classList.remove('popup-overlay--open');
	document.body.style.overflow = '';
}
