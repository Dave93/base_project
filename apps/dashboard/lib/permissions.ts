import { NewPermission, Permission } from "@auth-apps/db";
import { edenClient } from "./eden";


export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermissionsResponse {
  permissions: Permission[];
  pagination: PaginationData;
}

export async function getPermissions(page = 1, limit = 10) {
  const res = await edenClient.api.v1.permissions.index.get({
    query: {
      page,
      limit
    }
  });
  return res.data;
}

export async function getPermission(id: string) {
  const res = await edenClient.api.v1.permissions({
    id
  }).get();
  return res.data;
}

export async function createPermission(data: NewPermission) {
  const res = await edenClient.api.v1.permissions.index.post(data);
  return res.data;
}

export async function updatePermission(id: string, data: NewPermission) {
  const res = await edenClient.api.v1.permissions({
    id
  }).put(data);
  return res.data;
}

export async function deletePermission(id: string) {
  const res = await edenClient.api.v1.permissions({
    id
  }).delete();
  return res.data;
}