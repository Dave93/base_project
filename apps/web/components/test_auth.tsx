'use client'
import { useAuth } from "../hooks/useAuth";

export default function TestAuth() {
    const { user } = useAuth();
    return (
        <div>
            <h1>Test Auth</h1>
            <p>{user?.name}</p>
        </div>
    );
}