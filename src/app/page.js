import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Lief Healthcare
          </h1>
          <p className="text-muted-foreground">
            Clock in and out system for healthcare workers
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.69 8.38c0-.78.3-2.26 1.68-2.26 1.41 0 2.09 1.53 2.09 2.3 0 1.06-.54 2.31-2.05 2.31-1.49 0-1.72-1.61-1.72-2.35zm2.26 9.55c-1.38 0-3.14-.89-3.14-2.88 0-1.25.6-2.1 1.83-2.92.95-.67 2.37-1.1 3.71-1.12-.31-.39-.55-1.11-.55-1.55 0-.37.09-.74.21-1.06-1.35.11-3.01.92-3.01-1.19 0-1.27.5-2.42 1.5-3.15C10.4 4.5 11.73 4 12.38 4h3.76l-1.07.81h-1.24c.7.5 1.31 1.33 1.31 2.55 0 1.45-.81 2.11-1.62 2.76-.25.19-.53.42-.53.76 0 .36.28.54.48.7.64.46 1.45 1.03 1.45 2.4 0 1.4-1.43 3.04-4.44 3.04h-1.53v-.09zm2.92-3.68c-.2 0-.4-.02-.66-.02-.26 0-.92.04-1.35.16-.71.25-1.24.72-1.24 1.61 0 1.02.94 1.82 2.57 1.82 1.39 0 2.28-.77 2.28-1.79 0-.84-.51-1.37-1.6-1.78zm-1.95-8.88c-1.2 0-1.54 1.33-1.54 2.14 0 .81.25 1.71 1.41 1.71 1.17 0 1.5-1.11 1.5-1.95 0-.83-.35-1.9-1.37-1.9z" />
                </svg>
                Email
              </Button>
            </div> */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/careworker/dashboard">
                <Button>Sample Careworker</Button>
              </Link>
              <Link href="/manager/dashboard">
                <Button>Sample Manager</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
