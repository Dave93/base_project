
import TestAuth from "@/components/test_auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";


export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
            <Card className="max-w-md w-full mb-8">
                <CardHeader>
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-blue-600">Welcome to Auth Apps</h1>
                        <p className="mt-3 text-lg text-gray-600">
                            A simple authentication system with Next.js and Elysia.js
                        </p>
                    </div>
                </CardHeader>

                <CardContent>
                    <TestAuth />
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-4">
                            <Link href="/login" className="w-full">
                                <Button className="w-full" size="lg">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register" className="w-full">
                                <Button variant="outline" className="w-full" size="lg">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
} 