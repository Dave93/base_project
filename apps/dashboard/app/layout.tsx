import type { Metadata } from "next";
import "@/app/globals.css";

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
                <main className="min-h-screen bg-background">
                    {children}
                </main>
            </body>
        </html>
    );
} 