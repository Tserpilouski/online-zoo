import './style.scss';

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

const petsItems = document.querySelector('.pets__items');
const prevBtn = document.getElementById('pets-prev');
const nextBtn = document.getElementById('pets-next');

if (petsItems && prevBtn && nextBtn) {
	const cards = Array.from(petsItems.querySelectorAll('.pet-card'));
	let offset = 0;

	function getConfig() {
		if (window.innerWidth > 1200) return { visible: 6, step: 2 };
		if (window.innerWidth > 640) return { visible: 4, step: 2 };
		return { visible: 2, step: 1 };
	}

	function render() {
		const { visible } = getConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(offset, maxOffset);

		cards.forEach((card, i) => {
			card.style.display = i >= offset && i < offset + visible ? '' : 'none';
		});

		prevBtn.disabled = offset === 0;
		nextBtn.disabled = offset >= maxOffset;
	}

	prevBtn.addEventListener('click', () => {
		const { step } = getConfig();
		offset = Math.max(0, offset - step);
		render();
	});

	nextBtn.addEventListener('click', () => {
		const { visible, step } = getConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(maxOffset, offset + step);
		render();
	});

	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(render, 150);
	});

	render();
}

const animalsGrid = document.querySelector('.animals__grid-box');
const animalsDotsContainer = document.querySelector('.animals__dots');

if (animalsGrid && animalsDotsContainer) {
	const cards = Array.from(animalsGrid.querySelectorAll('.animals__card:not(.animals__card--main)'));
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

	function renderAnimals() {
		if (window.innerWidth > 640) {
			cards.forEach(card => (card.style.display = ''));
			return;
		}
		cards.forEach((card, i) => {
			card.style.display = i === offset ? '' : 'none';
		});
		dots.forEach((dot, i) => {
			dot.classList.toggle('animals__dot--active', i === offset);
		});
	}

	let animalsResizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(animalsResizeTimer);
		animalsResizeTimer = setTimeout(renderAnimals, 150);
	});

	renderAnimals();
}

const reviewItems = document.querySelector('.review__items');
const reviewPrev = document.getElementById('review-prev');
const reviewNext = document.getElementById('review-next');

if (reviewItems && reviewPrev && reviewNext) {
	const cards = Array.from(reviewItems.querySelectorAll('.review-card'));
	let offset = 0;

	function getReviewConfig() {
		if (window.innerWidth > 800) return { visible: 4, step: 2 };
		return { visible: 2, step: 2 };
	}

	function renderReview() {
		const { visible } = getReviewConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(offset, maxOffset);

		cards.forEach((card, i) => {
			card.style.display = i >= offset && i < offset + visible ? '' : 'none';
		});

		reviewPrev.disabled = offset === 0;
		reviewNext.disabled = offset >= maxOffset;
	}

	reviewPrev.addEventListener('click', () => {
		const { step } = getReviewConfig();
		offset = Math.max(0, offset - step);
		renderReview();
	});

	reviewNext.addEventListener('click', () => {
		const { visible, step } = getReviewConfig();
		const maxOffset = Math.max(0, cards.length - visible);
		offset = Math.min(maxOffset, offset + step);
		renderReview();
	});

	let reviewResizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(reviewResizeTimer);
		reviewResizeTimer = setTimeout(renderReview, 150);
	});

	renderReview();
}
