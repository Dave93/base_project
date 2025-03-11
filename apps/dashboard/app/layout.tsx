import type { Metadata } from "next";
import "@/app/globals.css";
import Providers from "../providers";

export const metadata: Metadata = {
    title: "Auth Apps - Dashboard",
    description: "Admin dashboard with authentication",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <main className="min-h-screen bg-background">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
} 