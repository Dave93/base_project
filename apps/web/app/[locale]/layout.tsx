import type { Metadata } from "next";
import "../globals.css";
import Providers from "../providers";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
export const metadata: Metadata = {
    title: "Auth Apps - Web",
    description: "Web application with authentication",
};


export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }
    const messages = await getMessages();
    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <main className="min-h-screen bg-background">
                            {children}
                        </main>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
} 