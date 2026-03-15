import './style.scss';
import { apiClient } from '../../api/client.ts';
import type { Camera, Pet } from '../../types/api.ts';
import { initHeaderUser } from '../../auth/header-user.ts';

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

const sidePanel = document.getElementById('side-panel');
const sidePanelToggle = document.getElementById('side-panel-toggle');

if (sidePanel && sidePanelToggle) {
	sidePanelToggle.addEventListener('click', () => {
		sidePanel.classList.toggle('side-panel--collapsed');
	});
}

let selectedPetId: number | null = null;
let currentPetLocation: { lat: number; lng: number } | null = null;

function getCameraImage(cam: Camera): string {
	return `../../assets/images/our-pets-${cam.id}.png`;
}

const CAMS_VISIBLE = 3;

async function loadCameras(): Promise<void> {
	const loaderEl = document.getElementById('live-cam-loader');
	const errorEl = document.getElementById('live-cam-error');
	const mainImg = document.getElementById('live-cam-main-img') as HTMLImageElement | null;
	const viewsEl = document.getElementById('live-cam-views');
	const sliderBox = document.getElementById('live-cam-slider-box');

	try {
		const data = await apiClient.getCameras();
		const cameras: Camera[] = Array.isArray(data) ? data : [];

		if (loaderEl) loaderEl.style.display = 'none';

		if (cameras.length > 0 && mainImg) {
			mainImg.src = getCameraImage(cameras[0]);
			mainImg.style.display = '';
		} else if (mainImg) {
			mainImg.src = '../../assets/images/panda-live.png';
			mainImg.style.display = '';
		}

		if (viewsEl) viewsEl.style.display = '';

		if (sliderBox && cameras.length > 0) {
			let camOffset = 0;

			function renderCamSlide(): void {
				sliderBox!.innerHTML = '';
				for (let i = 0; i < Math.min(CAMS_VISIBLE, cameras.length); i++) {
					const cam = cameras[(camOffset + i) % cameras.length];
					const imgSrc = getCameraImage(cam);
					const name = ((cam.name ?? cam.title) as string | undefined) ?? `cam ${cam.id}`;
					const isFirst = i === 0;

					const card = document.createElement('div');
					card.className = `live-cam__card${isFirst ? ' live-cam__card--active' : ''}`;
					card.innerHTML = `
						<div class="live-cam__card-title">
							<span>${name}</span>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0-7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM20 19a10 10 0 0 0-20 0h2a8 8 0 0 1 16 0h2z" fill="white"/>
							</svg>
						</div>
						<img class="live-cam__card-play" src="../../assets/icons/play-button.svg" alt="" />
						<img class="live-cam__card-play live-cam__card-play--active" src="../../assets/icons/play-button-active.svg" alt="" />
						<img class="live-cam__card-img" src="${imgSrc}" alt="${name}" />
					`;
					card.addEventListener('click', () => {
						sliderBox!.querySelectorAll('.live-cam__card').forEach(c => c.classList.remove('live-cam__card--active'));
						card.classList.add('live-cam__card--active');
						if (mainImg) mainImg.src = imgSrc;
					});
					sliderBox!.appendChild(card);
				}
			}

			renderCamSlide();

			const prevBtn = document.querySelector<HTMLButtonElement>('.live-cam__slider .btn--arrow:first-of-type');
			const nextBtn = document.querySelector<HTMLButtonElement>('.live-cam__slider .btn--arrow:last-of-type');

			if (cameras.length > CAMS_VISIBLE) {
				prevBtn?.addEventListener('click', () => {
					camOffset = (camOffset - 1 + cameras.length) % cameras.length;
					renderCamSlide();
				});
				nextBtn?.addEventListener('click', () => {
					camOffset = (camOffset + 1) % cameras.length;
					renderCamSlide();
				});
			}
		}
	} catch (err) {
		console.error('[API] GET /cameras failed', err);
		if (loaderEl) loaderEl.style.display = 'none';
		if (errorEl) errorEl.style.display = 'flex';
	}
}

const VISIBLE_COUNT = 4;

async function loadSidePanel(): Promise<void> {
	const list = document.getElementById('side-panel-list');
	const scrollBtn = document.querySelector<HTMLButtonElement>('.side-panel__scroll-btn');
	if (!list) return;

	list.innerHTML = '<li class="side-panel__loader">Loading...</li>';

	try {
		const data = await apiClient.getPets();
		const pets: Pet[] = Array.isArray(data)
			? data
			: (((data as unknown as Record<string, unknown>).data ??
				(data as unknown as Record<string, unknown>).pets ??
				(data as unknown as Record<string, unknown>).items ??
				[]) as Pet[]);

		if (pets.length === 0) {
			list.innerHTML = '';
			return;
		}

		let offset = 0;

		function renderSlide(): void {
			list!.innerHTML = '';
			for (let i = 0; i < Math.min(VISIBLE_COUNT, pets.length); i++) {
				const pet = pets[(offset + i) % pets.length];
				list!.appendChild(createPanelItem(pet));
			}
		}

		function createPanelItem(pet: Pet): HTMLLIElement {
			const imgSrc = `../../assets/images/our-pets-${pet.id}.png`;
			const isSelected = pet.id === selectedPetId;
			const li = document.createElement('li');
			li.className = `side-panel__item${isSelected ? ' side-panel__item--active' : ''}`;
			li.innerHTML = `
				<div class="side-panel__icon-wrap ${isSelected ? 'side-panel__icon-wrap--white' : 'side-panel__icon-wrap--orange'}">
					<img class="side-panel__icon" src="${imgSrc}" alt="${pet.name}" />
				</div>
				<p class="side-panel__desc">${pet.name}</p>
			`;
			li.addEventListener('click', async () => {
				selectedPetId = pet.id;
				renderSlide();
				await loadPetDetails(pet.id);
			});
			return li;
		}

		if (pets.length > 0) {
			selectedPetId = pets[0].id;
			renderSlide();
			await loadPetDetails(pets[0].id);
		}

		if (pets.length > VISIBLE_COUNT && scrollBtn) {
			scrollBtn.style.display = '';
			scrollBtn.addEventListener('click', () => {
				offset = (offset + 1) % pets.length;
				renderSlide();
			});
		} else if (scrollBtn) {
			scrollBtn.style.display = 'none';
		}
	} catch (err) {
		console.error('[API] GET /pets failed', err);
		list.innerHTML = '<li class="side-panel__loader">Failed to load pets</li>';
	}
}

async function loadPetDetails(id: number): Promise<void> {
	const overlay = document.getElementById('info-overlay');

	if (overlay) {
		overlay.innerHTML = '<div class="spinner"></div>';
		overlay.style.display = 'flex';
	}

	try {
		const pet = await apiClient.getPetById(id);
		renderInfoSection(pet);
		if (overlay) overlay.style.display = 'none';
	} catch (err) {
		console.error('[API] GET /pets/:id failed', err);
		if (overlay) {
			overlay.innerHTML = '<p class="info__error-text">Something went wrong. Please, refresh the page</p>';
		}
	}
}

function parseCoordinate(value: string): number | null {
	const match = value.match(/^([\d.]+)[°\s]*([NSEWnsew])?$/);
	if (!match) return null;
	const num = parseFloat(match[1]);
	if (isNaN(num)) return null;
	const dir = match[2]?.toUpperCase();
	return dir === 'S' || dir === 'W' ? -num : num;
}

function getPetLocation(pet: Pet): { lat: number; lng: number } | null {
	if (pet.latitude && pet.longitude) {
		const lat = parseCoordinate(pet.latitude);
		const lng = parseCoordinate(pet.longitude);
		if (lat !== null && lng !== null) return { lat, lng };
	}
	const r = pet as Record<string, unknown>;
	const loc = r.location as Record<string, number> | null | undefined;
	if (loc) {
		if (typeof loc.lat === 'number' && typeof loc.lng === 'number') return { lat: loc.lat, lng: loc.lng };
		if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') return { lat: loc.latitude, lng: loc.longitude };
	}
	return null;
}

const ARROW_SVG = `<svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2098 0.119971C13.0277 0.199174 12.8622 0.315255 12.7229 0.461565C12.5833 0.607505 12.4725 0.780876 12.397 0.971748C12.3214 1.16262 12.2825 1.36724 12.2825 1.57389C12.2825 1.78055 12.3214 1.98517 12.397 2.17604C12.4725 2.36691 12.5833 2.54028 12.7229 2.68622L18.7506 9H1.6C1.17565 9 0.768688 9.21071 0.468629 9.58579C0.168571 9.96086 0 10.4696 0 11C0 11.5304 0.168571 12.0391 0.468629 12.4142C0.768688 12.7893 1.17565 13 1.6 13H18.7514L12.7229 19.3146C12.4414 19.6096 12.2833 20.0097 12.2833 20.4269C12.2833 20.8441 12.4414 21.2443 12.7229 21.5393C13.0045 21.8343 13.3863 22 13.7845 22C14.1826 22 14.5645 21.8343 14.846 21.5393L23.842 12.1127C23.9816 11.9668 24.0924 11.7934 24.168 11.6026C24.2436 11.4117 24.2825 11.2071 24.2825 11.0004C24.2825 10.7938 24.2436 10.5891 24.168 10.3983C24.0924 10.2074 23.9816 10.034 23.842 9.88808L14.846 0.461565C14.7067 0.315255 14.5413 0.199174 14.3591 0.119971C14.177 0.0407677 13.9817 0 13.7845 0C13.5873 0 13.392 0.0407677 13.2098 0.119971Z" fill="white"/>
</svg>`;

function renderInfoSection(pet: Pet): void {
	const textBox = document.getElementById('info-text-box');
	const details = document.getElementById('info-details');
	const textContainer = document.getElementById('info-text-container');
	if (!textBox || !details || !textContainer) return;

	const r = pet as Record<string, unknown>;
	const displayName = (pet.commonName ?? r.common_name ?? pet.name ?? 'Animal') as string;
	const scientificName = ((pet.scientificName ?? r.scientific_name ?? '') as string);
	const type = (pet.type ?? '') as string;
	const size = (pet.size ?? '') as string;
	const diet = (pet.diet ?? '') as string;
	const habitat = (pet.habitat ?? '') as string;
	const range = (pet.range ?? '') as string;
	const shortDesc = (pet.description ?? '') as string;
	const longDesc = (pet.detailedDescription ?? shortDesc) as string;
	const imgSrc = `../../assets/images/our-pets-${pet.id}.png`;

	currentPetLocation = getPetLocation(pet);

	textBox.innerHTML = `
		<h3 class="h3">did you know?</h3>
		<p class="text">${shortDesc || `${displayName} is one of our amazing animals.`}</p>
	`;

	const fields: Array<[string, string]> = [
		['Common name:', displayName],
		['Scientific name:', scientificName],
		['Type:', type],
		['Size:', size],
		['Diet:', diet],
		['Habitat:', habitat],
		['Range:', range],
	].filter(([, v]) => Boolean(v)) as Array<[string, string]>;

	const itemsHtml = fields.map(([label, value]) => `
		<div class="animal-card__item">
			<span class="animal-card__label">${label}</span>
			<span class="animal-card__value">${value}</span>
		</div>
	`).join('');

	details.innerHTML = `
		<div class="animal-card">
			${itemsHtml}
			<button class="animal-card__btn btn btn--orange-no-bg" id="view-map-btn">
				<span>view map</span>
				${ARROW_SVG}
			</button>
		</div>
		<img src="${imgSrc}" alt="${displayName}" class="info__pet-img" />
	`;

	document.getElementById('view-map-btn')?.addEventListener('click', openMapModal);

	textContainer.innerHTML = longDesc ? `<p class="info__text text">${longDesc}</p>` : '';
}

function openMapModal(): void {
	const modal = document.getElementById('map-modal');
	const container = document.getElementById('map-container');
	if (!modal || !container) return;

	modal.style.display = 'flex';
	document.body.style.overflow = 'hidden';

	const lat = currentPetLocation?.lat ?? 20;
	const lng = currentPetLocation?.lng ?? 0;
	const delta = 3;
	const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
	const marker = currentPetLocation ? `&marker=${lat},${lng}` : '';

	container.innerHTML = `<iframe
		src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}"
		width="100%"
		height="100%"
		style="border:none;"
		title="Map"
	></iframe>`;
}

function closeMapModal(): void {
	const modal = document.getElementById('map-modal');
	const container = document.getElementById('map-container');
	if (!modal) return;
	modal.style.display = 'none';
	document.body.style.overflow = '';
	if (container) container.innerHTML = '';
}

document.getElementById('map-modal-close')?.addEventListener('click', closeMapModal);

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') closeMapModal();
});

document.getElementById('map-modal')?.addEventListener('click', (e) => {
	if ((e.target as HTMLElement).id === 'map-modal') closeMapModal();
});

loadCameras();
loadSidePanel();
