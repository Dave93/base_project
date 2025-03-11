import type { Metadata } from "next";
import "../globals.css";
import Providers from "../providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
    title: "Auth Apps - Dashboard",
    description: "Admin dashboard with authentication",
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
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