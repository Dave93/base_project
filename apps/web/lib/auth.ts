import { edenClient } from "./eden";


export async function login(username: string, password: string) {
    const { data } = await edenClient.api.v1.users.login.post({
        email: username,
        password
    });

    return data ? data.user : null;
}

export async function getCurrentUser() {
    const res = await edenClient.api.v1.users.me.get();
    return res.data ? res.data : null;
}

export async function logout() {
    const res = await edenClient.api.v1.users.logout.post();
    return res.data;
}