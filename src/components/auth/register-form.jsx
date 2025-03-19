"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMutation } from "@apollo/client"
import { REGISTER_MUTATION } from "@/lib/graphql/mutations"
// import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["careworker", "manager"], {
        required_error: "Please select a role",
    }),
})

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [register] = useMutation(REGISTER_MUTATION)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "careworker",
        },
    })

    async function onSubmit(values) {
        setIsLoading(true)

        try {
            const [firstName, ...lastNameParts] = values.name.split(' ')
            const lastName = lastNameParts.join(' ')

            const { data } = await register({
                variables: {
                    input: {
                        email: values.email,
                        password: values.password,
                        firstName,
                        lastName,
                        role: values.role.toUpperCase(),
                    },
                },
            })

            const { token, user } = data.register
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // toast({
            //     title: "Registration successful",
            //     description: "Your account has been created",
            // })

            form.reset()
            router.push("/")
        } catch (error) {
            // toast({
            //     variant: "destructive",
            //     title: "Registration failed",
            //     description: error.message || "There was a problem creating your account",
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Account Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="careworker" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Care Worker</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="manager" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Manager</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                </Button>
            </form>
        </Form>
    )
}

