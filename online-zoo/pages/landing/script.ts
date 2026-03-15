import './style.scss';
import { apiClient } from '../../api/client.ts';
import type { Pet, Feedback } from '../../types/api.ts';

const ARROW_SVG = `<svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd"
		d="M13.2098 0.119971C13.0277 0.199174 12.8622 0.315255 12.7229 0.461565C12.5833 0.607505 12.4725 0.780876 12.397 0.971748C12.3214 1.16262 12.2825 1.36724 12.2825 1.57389C12.2825 1.78055 12.3214 1.98517 12.397 2.17604C12.4725 2.36691 12.5833 2.54028 12.7229 2.68622L18.7506 9H1.6C1.17565 9 0.768688 9.21071 0.468629 9.58579C0.168571 9.96086 0 10.4696 0 11C0 11.5304 0.168571 12.0391 0.468629 12.4142C0.768688 12.7893 1.17565 13 1.6 13H18.7514L12.7229 19.3146C12.4414 19.6096 12.2833 20.0097 12.2833 20.4269C12.2833 20.8441 12.4414 21.2443 12.7229 21.5393C13.0045 21.8343 13.3863 22 13.7845 22C14.1826 22 14.5645 21.8343 14.846 21.5393L23.842 12.1127C23.9816 11.9668 24.0924 11.7934 24.168 11.6026C24.2436 11.4117 24.2825 11.2071 24.2825 11.0004C24.2825 10.7938 24.2436 10.5891 24.168 10.3983C24.0924 10.2074 23.9816 10.034 23.842 9.88808L14.846 0.461565C14.7067 0.315255 14.5413 0.199174 14.3591 0.119971C14.177 0.0407677 13.9817 0 13.7845 0C13.5873 0 13.392 0.0407677 13.2098 0.119971Z"
		fill="white" />
</svg>`;

function createPetCard(pet: Pet): HTMLDivElement {
	const card = document.createElement('div');
	card.className = 'pet-card';
	card.innerHTML = `
		<img class="pet-card__img" src="${`../../assets/images/our-pets-${pet.id}.png` || ''}" alt="${pet.name}" />
		<span class="pet-card__name">${pet.name}</span>
		<div class="pet-card__description">
			<span class="pet-card__title">${pet.commonName || ''}</span>
			<p class="pet-card__text text">${pet.description || ''}</p>
			<button class="pet-card__btn btn btn--orange-no-bg">
				<span>view live cam</span>
				${ARROW_SVG}
			</button>
		</div>
	`;
	return card;
}

function initPetsCarousel(): void {
	const petsItems = document.querySelector('.pets__items');
	const prevBtn = document.getElementById('pets-prev') as HTMLButtonElement | null;
	const nextBtn = document.getElementById('pets-next') as HTMLButtonElement | null;

	if (!petsItems || !prevBtn || !nextBtn) return;

	const cards = Array.from(petsItems.querySelectorAll<HTMLElement>('.pet-card'));
	let offset = 0;

	function getConfig(): { visible: number; step: number } {
		if (window.innerWidth > 1200) return { visible: 6, step: 2 };
		if (window.innerWidth > 640) return { visible: 4, step: 2 };
		return { visible: 2, step: 1 };
	}

	function render(): void {
		const { visible } = getConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = ((offset % (maxOffset + 1)) + (maxOffset + 1)) % (maxOffset + 1);
		cards.forEach((card, i) => {
			card.style.display = i >= offset && i < offset + visible ? '' : 'none';
		});
	}

	prevBtn.addEventListener('click', () => {
		const { visible, step } = getConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = offset - step < 0 ? maxOffset : offset - step;
		render();
	});

	nextBtn.addEventListener('click', () => {
		const { visible, step } = getConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = offset + step > maxOffset ? 0 : offset + step;
		render();
	});

	let resizeTimer: ReturnType<typeof setTimeout>;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(render, 150);
	});

	render();
}

function createErrorMessage(): HTMLParagraphElement {
	const el = document.createElement('p');
	el.className = 'section-error';
	el.textContent = 'Something went wrong. Please, refresh the page';
	return el;
}

async function loadPets(): Promise<void> {
	const petsItems = document.querySelector('.pets__items');
	if (!petsItems) return;

	try {
		const [data] = await Promise.all([
			apiClient.getPets(),
			new Promise<void>((resolve) => setTimeout(resolve, 2000)),
		]);
		const pets: Pet[] = Array.isArray(data)
			? data
			: (((data as unknown as Record<string, unknown>).data ??
				(data as unknown as Record<string, unknown>).pets ??
				(data as unknown as Record<string, unknown>).items ??
				[]) as Pet[]);
		pets.forEach((pet) => {
			petsItems.appendChild(createPetCard(pet));
		});
	} catch (err) {
		console.error('[API] GET /pets failed', err);
		const loader = petsItems.querySelector('.pets__loader');
		if (loader) loader.replaceWith(createErrorMessage());
		return;
	}

	petsItems.querySelector('.pets__loader')?.remove();
	initPetsCarousel();
}

loadPets();

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

const animalsGrid = document.querySelector('.animals__grid-box');
const animalsDotsContainer = document.querySelector('.animals__dots');

if (animalsGrid && animalsDotsContainer) {
	const cards = Array.from(animalsGrid.querySelectorAll<HTMLElement>('.animals__card:not(.animals__card--main)'));
	let offset = 0;

	const dots = cards.map((_, i) => {
		const dot = document.createElement('span');
		dot.classList.add('animals__dot');
		if (i === 0) dot.classList.add('animals__dot--active');
		dot.addEventListener('click', () => {
			offset = i;
			renderAnimals();
		});
		animalsDotsContainer.appendChild(dot);
		return dot;
	});

	function renderAnimals(): void {
		if (window.innerWidth > 640) {
			cards.forEach((card) => (card.style.display = ''));
			return;
		}
		cards.forEach((card, i) => {
			card.style.display = i === offset ? '' : 'none';
		});
		dots.forEach((dot, i) => {
			dot.classList.toggle('animals__dot--active', i === offset);
		});
	}

	let animalsResizeTimer: ReturnType<typeof setTimeout>;
	window.addEventListener('resize', () => {
		clearTimeout(animalsResizeTimer);
		animalsResizeTimer = setTimeout(renderAnimals, 150);
	});

	renderAnimals();
}

const QUOTE_SVG = `<svg width="59" height="45" viewBox="0 0 59 45" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M20.2798 19.56C22.5198 20.6 24.2398 22.16 25.4398 24.24C26.7198 26.24 27.3598 28.6 27.3598 31.32C27.3598 35.32 26.0798 38.56 23.5198 41.04C20.9598 43.52 17.6798 44.76 13.6798 44.76C9.67977 44.76 6.39977 43.52 3.83977 41.04C1.27977 38.56 -0.000234291 35.32 -0.000234291 31.32C-0.000234291 29.48 0.239766 27.64 0.719766 25.8C1.19977 23.96 2.27977 21.24 3.95977 17.64L11.6398 -2.71797e-05H25.9198L20.2798 19.56ZM51.7198 19.56C53.9598 20.6 55.6798 22.16 56.8798 24.24C58.1598 26.24 58.7998 28.6 58.7998 31.32C58.7998 35.32 57.5198 38.56 54.9598 41.04C52.3998 43.52 49.1198 44.76 45.1198 44.76C41.1198 44.76 37.8398 43.52 35.2798 41.04C32.7198 38.56 31.4398 35.32 31.4398 31.32C31.4398 29.48 31.6798 27.64 32.1598 25.8C32.6398 23.96 33.7198 21.24 35.3998 17.64L43.0798 -2.71797e-05H57.3598L51.7198 19.56Z" fill="#00A092" />
</svg>`;

function createReviewCard(feedback: Feedback): HTMLDivElement {
	const card = document.createElement('div');
	card.className = 'review-card';
	card.innerHTML = `
		<div class="review-card__icon">${QUOTE_SVG}</div>
		<span class="review-card__location">${feedback.city}, ${feedback.month} ${feedback.year}</span>
		<p class="review-card__text text">${feedback.text}</p>
		<span class="review-card__user-name">${feedback.name}</span>
	`;
	return card;
}

function initReviewCarousel(): void {
	const reviewItems = document.querySelector('.review__items');
	const reviewPrev = document.getElementById('review-prev') as HTMLButtonElement | null;
	const reviewNext = document.getElementById('review-next') as HTMLButtonElement | null;

	if (!reviewItems || !reviewPrev || !reviewNext) return;

	const prev = reviewPrev;
	const next = reviewNext;

	const cards = Array.from(reviewItems.querySelectorAll<HTMLElement>('.review-card'));
	let offset = 0;

	function getReviewConfig(): { visible: number; step: number } {
		if (window.innerWidth > 800) return { visible: 4, step: 2 };
		return { visible: 2, step: 2 };
	}

	function renderReview(): void {
		const { visible } = getReviewConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(offset, maxOffset);
		cards.forEach((card, i) => {
			card.style.display = i >= offset && i < offset + visible ? '' : 'none';
		});
		prev.disabled = offset === 0;
		next.disabled = offset >= maxOffset;
	}

	prev.addEventListener('click', () => {
		const { step } = getReviewConfig();
		offset = Math.max(0, offset - step);
		renderReview();
	});

	next.addEventListener('click', () => {
		const { visible, step } = getReviewConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(maxOffset, offset + step);
		renderReview();
	});

	let reviewResizeTimer: ReturnType<typeof setTimeout>;
	window.addEventListener('resize', () => {
		clearTimeout(reviewResizeTimer);
		reviewResizeTimer = setTimeout(renderReview, 150);
	});

	renderReview();
}

async function loadFeedback(): Promise<void> {
	const reviewItems = document.querySelector('.review__items');
	if (!reviewItems) return;

	try {
		const [data] = await Promise.all([
			apiClient.getFeedback(),
			new Promise<void>((resolve) => setTimeout(resolve, 2000)),
		]);
		const items: Feedback[] = Array.isArray(data)
			? data
			: (((data as unknown as Record<string, unknown>).data ??
				(data as unknown as Record<string, unknown>).feedback ??
				(data as unknown as Record<string, unknown>).items ??
				[]) as Feedback[]);
		items.forEach((feedback) => {
			reviewItems.appendChild(createReviewCard(feedback));
		});
	} catch (err) {
		console.error('[API] GET /feedback failed', err);
		const loader = reviewItems.querySelector('.review__loader');
		if (loader) loader.replaceWith(createErrorMessage());
		return;
	}

	reviewItems.querySelector('.review__loader')?.remove();
	initReviewCarousel();
}

loadFeedback();
