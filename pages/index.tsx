import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useSession } from "@/context/SessionContext";
import { getClientInfo } from "@/utils/client-info";
import { fetchWithErrorHandling } from "@/utils/api-error";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const { setSession, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setError(null);
      
      // Get client information
      const clientInfo = await getClientInfo().catch((error) => {
        console.error('Error getting client info:', error);
        // Return basic client info if API fails
        return {
          ipAddress: '',
          latitude: 0,
          longitude: 0,
          userAgent: window.navigator.userAgent,
          deviceType: 'unknown',
          browser: 'unknown',
          os: 'unknown',
          timestamp: new Date().toISOString()
        };
      });

      const data = await fetchWithErrorHandling('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          clientInfo,
        }),
      });

      if (data.success) {
        // Store session in sessionStorage
        sessionStorage.setItem('session', JSON.stringify(data.sessionData));
        setSession(data.sessionData);
        toast.success('Login successful');
        router.push("/dashboard");
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const message = error.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionLoading) {
      return;
    }
    if (typeof window !== "undefined" && window.sessionStorage) {
      const session = sessionStorage.getItem("session");
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          if (new Date(parsedSession.expiresAt) > new Date()) {
            router.push("/dashboard");
          } else {
            sessionStorage.removeItem("session");
          }
        } catch (error) {
          console.error('Invalid session data:', error);
          sessionStorage.removeItem("session");
        }
      }
    }
  }, [sessionLoading, router]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
