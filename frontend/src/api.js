const BASE_URL = "http://localhost:8000";

async function parseResponse(response) {
    const rawText = await response.text();
    let data = {};

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || `Request failed (${response.status})`);
    }

    return data;
}

export async function signupUser(payload) {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response);
}

export async function loginUser(payload) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response);
}

export async function getSubjects() {
    const response = await fetch(`${BASE_URL}/subjects`);
    return parseResponse(response);
}

export async function startQuiz(payload) {
    const response = await fetch(`${BASE_URL}/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response);
}

export async function submitAnswer(payload) {
    const response = await fetch(`${BASE_URL}/answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response);
}

export async function getDashboard(userId) {
    const response = await fetch(`${BASE_URL}/dashboard/${encodeURIComponent(userId)}`);
    return parseResponse(response);
}
