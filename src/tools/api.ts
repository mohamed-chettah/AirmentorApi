import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

class Api {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: 'http://localhost:3001/', // your API base URL
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async get<JSON>(path: string, headers?: AxiosRequestConfig): Promise<JSON> {
        try {
            const response: AxiosResponse<JSON> = await this.api.get<JSON>(path, { ...headers });
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    async post<JSON>(path: string, data: JSON): Promise<JSON> {
        try {
            const response: AxiosResponse<JSON> = await this.api.post<JSON>(path, data);
            return response.data;
        } catch (error) {
            console.error('Error posting data:', error);
            throw error;
        }
    }

    async delete<JSON>(path: string, id: number): Promise<JSON> {
        try {
            const response: AxiosResponse<JSON> = await this.api.delete<JSON>(`${path}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    async put<JSON>(path: string, id: number, body: any): Promise<JSON> {
        try {
            const response: AxiosResponse<JSON> = await this.api.put<JSON>(`${path}/${id}`, JSON.stringify(body));
            return response.data;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    async patch<JSON>(path: string, id: number, body: any): Promise<JSON> {
        try {
            const response: AxiosResponse<JSON> = await this.api.patch<JSON>(`${path}/${id}`, JSON.stringify(body));
            return response.data;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }
}

export default new Api();
