import { edenClient } from "./eden";

// Определяем интерфейс User вместо импорта из схемы базы данных
export interface User {
  id: string;
  email: string;
  name: string | null;
  role_id: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export async function getUsers(page: number = 1, pageSize: number = 10): Promise<UsersResponse | null> {
  try {
    // @ts-ignore - игнорируем ошибки типизации для Eden API
    const { data } = await edenClient.api.v1.users.get({
      query: {
        page,
        pageSize
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

export async function getUser(id: string): Promise<{ user: User } | null> {
  try {
    // @ts-ignore - игнорируем ошибки типизации для Eden API
    const { data } = await edenClient.api.v1.users[id].get();
    return data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  name?: string;
  role_id?: string;
}): Promise<{ user: User } | null> {
  try {
    // @ts-ignore - игнорируем ошибки типизации для Eden API
    const { data } = await edenClient.api.v1.users.post(userData);
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUser(
  id: string,
  userData: {
    email?: string;
    name?: string;
    role_id?: string;
    password?: string;
  }
): Promise<{ user: User } | null> {
  try {
    // @ts-ignore - игнорируем ошибки типизации для Eden API
    const { data } = await edenClient.api.v1.users[id].put(userData);
    return data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean } | null> {
  try {
    // @ts-ignore - игнорируем ошибки типизации для Eden API
    const { data } = await edenClient.api.v1.users[id].delete();
    return data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return null;
  }
} 