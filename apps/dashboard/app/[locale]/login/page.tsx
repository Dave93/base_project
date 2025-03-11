"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockIcon, MailIcon, ArrowRightIcon } from "lucide-react";
import { showToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Define the form schema with Zod
const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Infer the type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, signIn, isLoggingIn, loginError } = useAuth();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    // Initialize react-hook-form with zod resolver
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Form submission handler
    const onSubmit = async (data: LoginFormValues) => {
        try {
            signIn(data.email, data.password);
            showToast.success("Login successful");
            // The redirect will happen automatically when user state updates
        } catch (error) {
            showToast.error("Login failed");
        }
    };

    // If still loading, show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome back</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
                </div>

                <Card className="border-border/40 shadow-lg">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
                            <CardDescription>
                                Enter your email and password to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loginError && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                    {loginError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <MailIcon className="h-5 w-5" />
                                    </span>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder="Email address"
                                        className={`pl-10 ${errors.email ? "border-destructive ring-destructive/20" : ""}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <LockIcon className="h-5 w-5" />
                                    </span>
                                    <Input
                                        {...register("password")}
                                        type="password"
                                        placeholder="Password"
                                        className={`pl-10 ${errors.password ? "border-destructive ring-destructive/20" : ""}`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
                                )}
                                <div className="flex items-center justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full group"
                                disabled={isSubmitting || isLoggingIn}
                            >
                                {isSubmitting || isLoggingIn ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" type="button" className="w-full">
                                    Google
                                </Button>
                                <Button variant="outline" type="button" className="w-full">
                                    GitHub
                                </Button>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
} 