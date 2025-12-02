// app/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the real API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store the access token
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Store refresh token if provided
      if (result.refresh_token) {
        localStorage.setItem("refresh_token", result.refresh_token);
      }

      // Handle remember me
      if (data.rememberMe) {
        localStorage.setItem("remember_me", "true");
        // Set cookie for 30 days
        document.cookie = `remember_me=true; max-age=${30 * 24 * 60 * 60}; path=/`;
      } else {
        localStorage.removeItem("remember_me");
        document.cookie = "remember_me=; max-age=0; path=/";
      }

      // Redirect based on user role
      redirectBasedOnRole(result.user);
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (user: any) => {
    if (user.role === "ADMIN") {
      // Redirect to admin dashboard based on admin level
      switch (user.adminLevel) {
        case "SUPER_ADMIN":
          router.push("/dashboard/admin/super");
          break;
        case "MARKET_MASTER":
          router.push("/dashboard/admin/market");
          break;
        case "CITY_ADMIN":
          router.push("/dashboard/admin/city");
          break;
        default:
          router.push("/dashboard/admin");
      }
    } else if (user.role === "STAKEHOLDER") {
      // Check KYC status
      if (user.kycStatus === "VERIFIED") {
        router.push("/dashboard/vendor");
      } else if (user.kycStatus === "PENDING") {
        router.push("/dashboard/kyc-pending");
      } else {
        router.push("/dashboard/profile");
      }
    } else {
      // Default dashboard
      router.push("/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get email from form
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      alert("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to process forgot password request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/contact");
  };

  // Check for existing remember me on component mount
  React.useEffect(() => {
    const remembered = localStorage.getItem("remember_me");
    if (remembered === "true") {
      setValue("rememberMe", true);
    }
  }, [setValue]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Uganda Market Management System
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
                {...register("email")}
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                disabled={isLoading}
                className={errors.password ? "border-red-500" : ""}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => {
                  setValue("rememberMe", checked as boolean);
                }}
                disabled={isLoading}
                aria-label="Remember me"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label={isLoading ? "Signing in..." : "Sign in"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Register as Vendor/Supplier
              </Link>
            </div>
            
            <div className="text-sm text-center text-gray-600">
              Admin access?{" "}
              <button
                type="button"
                onClick={handleContactAdmin}
                className="text-blue-600 font-medium hover:underline focus:outline-none"
                disabled={isLoading}
              >
                Contact System Admin
              </button>
            </div>

            {/* Demo credentials notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <ul className="space-y-1">
                <li>Super Admin: superadmin@uganda.gov / admin123</li>
                <li>Vendor: vendor1@market.com / vendor123</li>
              </ul>
            </div>

            {/* Return to home */}
            <div className="text-xs text-center text-gray-500">
              <Link
                href="/"
                className="hover:underline"
                aria-label="Return to home page"
              >
                ← Return to home page
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}