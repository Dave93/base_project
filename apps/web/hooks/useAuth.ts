'use client'
// frontend/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { getCurrentUser, login, logout } from "../lib/auth";
import { AuthUser } from "../../api/src/controllers/v1/users/user.dto";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export function useAuth() {

    const queryClient = useQueryClient();
    // Query to fetch current user
    const { data: user, isLoading: loading } = useQuery<AuthUser | null>({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const data = await getCurrentUser();
            return data;
        },
        retry: false, // Don't retry on failure
    });

    // Mutation for login
    const loginMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            login(username, password),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            }
        },
    });

    // Mutation for logout
    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(["currentUser"], null);
        },
    });

    const signIn = (username: string, password: string) =>
        loginMutation.mutate({ username, password });

    const signOut = () => logoutMutation.mutate();

    return {
        user,
        loading,
        signIn,
        signOut,
        loginError: loginMutation.error?.message,
        isLoggingIn: loginMutation.isPending,
    };
}