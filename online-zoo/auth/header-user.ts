import { getToken, loadProfile, clearAuth } from './user.ts';

const USER_ICON_SVG = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
	<circle cx="14" cy="10" r="5.5" stroke="currentColor" stroke-width="2"/>
	<path d="M3 27c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export async function initHeaderUser(): Promise<void> {
	const userBtn = document.getElementById('header-user-btn');
	const popup = document.getElementById('header-user-popup');
	const userNameEl = document.getElementById('header-user-name');
	const mobileUserEl = document.getElementById('header-mobile-user');

	if (!userBtn || !popup) return;

	const token = getToken();

	if (token) {
		const profile = await loadProfile();

		if (profile) {
			if (userNameEl) userNameEl.textContent = profile.name;

			popup.innerHTML = `
				<div class="user-popup__profile">
					<div class="user-popup__avatar">${USER_ICON_SVG}</div>
					<div class="user-popup__info">
						<p class="user-popup__name">${escapeHtml(profile.name)}</p>
						<p class="user-popup__email">${escapeHtml(profile.email)}</p>
					</div>
					<button class="user-popup__signout" id="user-signout">Sign Out</button>
				</div>
			`;

			if (mobileUserEl) {
				mobileUserEl.innerHTML = `
					<div class="header__mobile-user-info">
						<p class="header__mobile-user-name">${escapeHtml(profile.name)}</p>
						<p class="header__mobile-user-email">${escapeHtml(profile.email)}</p>
					</div>
					<button class="header__mobile-signout" id="user-signout-mobile">Sign Out</button>
				`;
				document.getElementById('user-signout-mobile')?.addEventListener('click', handleSignOut);
			}

			document.getElementById('user-signout')?.addEventListener('click', handleSignOut);
		}
	} else {
		popup.innerHTML = `
			<a class="user-popup__link" href="../sign-in/index.html">Sign In</a>
			<a class="user-popup__link" href="../registration/index.html">Registration</a>
		`;

		if (mobileUserEl) {
			mobileUserEl.innerHTML = `
				<a class="header__nav-item" href="../sign-in/index.html">Sign In</a>
				<a class="header__nav-item" href="../registration/index.html">Registration</a>
			`;
		}
	}

	userBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		popup.classList.toggle('header__user-popup--open');
	});

	document.addEventListener('click', () => {
		popup.classList.remove('header__user-popup--open');
	});

	popup.addEventListener('click', (e) => {
		e.stopPropagation();
	});
}

function handleSignOut(): void {
	clearAuth();
	window.location.reload();
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
