"use client"

import * as React from "react"
import {
  Settings2,
  Users,
  Shield,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

// Данные навигации
const navItems = [
  {
    title: "Настройки",
    url: "#",
    icon: Settings2,
    isActive: true,
    items: [
      {
        title: "Пользователи",
        url: "/dashboard/users",
      },
      {
        title: "Разрешения",
        url: "/dashboard/permissions",
      },
      {
        title: "Роли",
        url: "/dashboard/roles",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Получаем данные текущего пользователя из хука useAuth
  const { user, loading } = useAuth();
  
  // Формируем данные для компонента NavUser
  const userData = React.useMemo(() => ({
    name: user?.name || "Пользователь",
    email: user?.email || user?.id || "",
    avatar: "", // Аватар отсутствует в данных useAuth
  }), [user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center p-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
