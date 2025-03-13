"use client";

import { RolePermissions } from "@/components/roles/role-permissions";

interface RolePermissionsPageProps {
  params: {
    id: string;
  };
}

export default function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  return <RolePermissions roleId={params.id} />;
}
