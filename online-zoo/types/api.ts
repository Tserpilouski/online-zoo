export interface Pet {
	id: number;
	name: string;
	commonName?: string;
	description?: string;
	imageUrl?: string;
	[key: string]: unknown;
}

export interface Camera {
	id: number;
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
