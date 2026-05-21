import axios from "axios"


const api = axios.create({
    baseURL: "https://gen-ai-backend-pufr.onrender.com",
    withCredentials: true
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {

        console.log(err)

    }

}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })

        localStorage.setItem("token", response.data.token)

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {

    }
}

export async function getMe() {
    try {
        const token = localStorage.getItem("token")

        const response = await api.get("/api/auth/get-me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data

    } catch (err) {
        console.log(err)
    }
}