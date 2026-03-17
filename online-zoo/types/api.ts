export interface PetLocation {
	lat?: number;
	lng?: number;
	latitude?: number;
	longitude?: number;
}

export interface Pet {
	id: number;
	name?: string;
	commonName?: string;
	scientificName?: string;
	description?: string;
	detailedDescription?: string;
	type?: string;
	size?: string;
	diet?: string;
	habitat?: string;
	range?: string;
	latitude?: string;
	longitude?: string;
	location?: PetLocation;
	[key: string]: unknown;
}

export interface Camera {
	id: number;
	name?: string;
	title?: string;
	description?: string;
	petId?: number;
	[key: string]: unknown;
}

export interface Feedback {
	id: number;
	city: string;
	month: string;
	year: string;
	text: string;
	name: string;
}

export interface RegisterRequest {
	login: string;
	password: string;
	name: string;
	email: string;
}

export interface LoginRequest {
	login: string;
	password: string;
}

export interface LoginResponse {
	token: string;
}

export interface UserProfile {
	id: number;
	login: string;
	name: string;
	email: string;
}

export interface DonationRequest {
	name: string;
	email: string;
	amount: number;
	petId: number;
}

export interface ApiError {
	message: string;
	statusCode: number;
}
