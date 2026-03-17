import type {
	Camera,
	DonationRequest,
	Feedback,
	LoginRequest,
	LoginResponse,
	Pet,
	RegisterRequest,
	UserProfile,
} from '../types/api.ts';

const BASE_URL = 'https://vsqsnqnxkh.execute-api.eu-central-1.amazonaws.com/prod';

export class ApiClient {
	private token: string | null = null;

	setToken(token: string | null): void {
		this.token = token;
	}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		const response = await fetch(`${BASE_URL}${path}`, {
			...options,
			headers: { ...headers, ...(options.headers as Record<string, string>) },
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return response.json() as Promise<T>;
	}

	getPets(): Promise<Pet[]> {
		return this.request<Pet[]>('/pets');
	}

	async getPetById(id: number): Promise<Pet> {
		const res = await this.request<Pet | { data: Pet }>(`/pets/${id}`);
		const pet = (res as { data?: Pet }).data ?? (res as Pet);
		return pet;
	}

	getCameras(): Promise<Camera[]> {
		return this.request<Camera[]>('/cameras');
	}

	getFeedback(): Promise<Feedback[]> {
		return this.request<Feedback[]>('/feedback');
	}

	register(data: RegisterRequest): Promise<void> {
		return this.request<void>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		});
		this.setToken(response.token);
		return response;
	}

	getProfile(): Promise<UserProfile> {
		return this.request<UserProfile>('/auth/profile');
	}

	createDonation(data: DonationRequest): Promise<void> {
		return this.request<void>('/donations', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}
}

export const apiClient = new ApiClient();
