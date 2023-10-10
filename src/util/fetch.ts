import axios from "axios";

export async function getJson(url: string): Promise<[number, any]> {
    const response = await fetch(url);
    const status = response.status
    return [status, await response.json()];
}

export async function sendData(url = "", data = {}): Promise<[number, any]> {
    // Default options are marked with *
    const response = await axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
        }
    })

    const status = response.status
    return [status, await response.data];
}