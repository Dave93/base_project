import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Manage your application and users
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="flex flex-col space-y-4">
                        <Link href="/login" className="w-full">
                            <Button className="w-full">Login to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 