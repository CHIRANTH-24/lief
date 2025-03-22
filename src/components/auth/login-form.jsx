"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation } from "@apollo/client"
import { LOGIN_MUTATION } from "@/lib/graphql/mutations"
// import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [login] = useMutation(LOGIN_MUTATION)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values) {
        setIsLoading(true)

        try {
            const { data } = await login({
                variables: {
                    input: {
                        email: values.email,
                        password: values.password,
                    },
                },
            })

            const { token, user } = data.login
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            if (user.role === "MANAGER") {
                router.push("/manager/dashboard")
            } else {
                router.push("/careworker/dashboard")
            }

            // toast({
            //     title: "Login successful",
            //     description: "Welcome back to Lief Healthcare",
            // })
        } catch (error) {
            // toast({
            //     variant: "destructive",
            //     title: "Login failed",
            //     description: error.message || "Please check your credentials and try again",
            // })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                </Button>
            </form>
        </Form>
    )
}

