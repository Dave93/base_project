import { Role } from "@auth-apps/db";
import { edenClient } from "./eden";

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RolesResponse {
  roles: Role[];
  pagination: PaginationData;
}

export interface RoleResponse {
  role: Role;
}

export interface RolePermission {
  id: string;
  permission_id: string;
  permission: {
    id: string;
    name: string;
    code: string;
  };
}

export interface RolePermissionsResponse {
  permissions: RolePermission[];
}

export interface NewRole {
  name: string;
  code: string;
  description?: string;
  active?: boolean;
}

// Get all roles with pagination
export async function getRoles(page = 1, limit = 10) {
  const res = await edenClient.api.v1.roles.index.get({
    query: {
      page,
      limit
    }
  });
  return res.data;
}

// Get a single role by ID
export async function getRole(id: string) {
  const res = await edenClient.api.v1.roles({
    id
  }).get();
  return res.data;
}

// Create a new role
export async function createRole(data: NewRole) {
  const res = await edenClient.api.v1.roles.index.post(data);
  return res.data;
}

// Update an existing role
export async function updateRole(id: string, data: NewRole) {
  const res = await edenClient.api.v1.roles({
    id
  }).put(data);
  return res.data;
}

// Delete a role
export async function deleteRole(id: string) {
  const res = await edenClient.api.v1.roles({
    id
  }).delete();
  return res.data;
}

// Get permissions for a role
export async function getRolePermissions(roleId: string) {
  const res = await edenClient.api.v1.roles({
    id: roleId
  }).permissions.get();
  return res.data;
}

// Add a permission to a role
export async function addPermissionToRole(roleId: string, permissionId: string) {
  const res = await edenClient.api.v1.roles({
    id: roleId
  }).permissions.post({
    permission_id: permissionId
  });
  return res.data;
}

// Remove a permission from a role
export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const res = await edenClient.api.v1.roles({
    id: roleId
  }).permissions({
    permission_id: permissionId
  }).delete();
  return res.data;
}
