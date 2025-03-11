import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Forbidden - 403',
};

export default function ForbiddenPage() {
    const t = useTranslations('Forbidden');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3-3h10l3 3z"
                        />
                    </svg>
                </div>
                <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {t('title', { fallback: 'Access Forbidden' })}
                </h2>
                <p className="text-gray-600 mb-8">
                    {t('message', { fallback: 'You do not have permission to access this resource.' })}
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {t('backToHome', { fallback: 'Back to Home' })}
                </Link>
            </div>
        </div>
    );
} 