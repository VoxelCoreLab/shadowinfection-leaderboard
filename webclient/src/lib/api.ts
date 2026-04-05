import { Api } from '../generated/api-client'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const api = new Api({
    baseURL,
})
