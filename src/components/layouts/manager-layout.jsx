"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Users, Settings, LogOut, Menu, MapPin, Clock, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// import {toast} from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth/auth-provider"
import { ApolloProvider } from "@apollo/client"
import { client } from "@/lib/apollo-client"


export function ManagerLayout({ children }) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push("/")
        // toast({
        //     title: "Logged out",
        //     description: "You have been logged out successfully",
        // })
    }

    const routes = [
        {
            href: "/manager/dashboard",
            label: "Dashboard",
            icon: Home,
            active: pathname === "/manager/dashboard",
        },
        {
            href: "/manager/staff",
            label: "Staff",
            icon: Users,
            active: pathname === "/manager/staff",
        },
        {
            href: "/manager/analytics",
            label: "Analytics",
            icon: BarChart,
            active: pathname === "/manager/analytics",
        },
        {
            href: "/manager/perimeter",
            label: "Perimeter",
            icon: MapPin,
            active: pathname === "/manager/perimeter",
        },
        {
            href: "/manager/shifts",
            label: "Shifts",
            icon: Clock,
            active: pathname === "/manager/shifts",
        },
        {
            href: "/manager/settings",
            label: "Settings",
            icon: Settings,
            active: pathname === "/manager/settings",
        },
    ]

    return (
        <ApolloProvider client={client}>
            <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-40 border-b bg-background">
                    <div className="container flex h-16 items-center justify-between py-4">
                        <div className="flex items-center gap-2">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72">
                                    <div className="flex flex-col space-y-4 py-4">
                                        <div className="px-3 py-2">
                                            <h2 className="mb-2 text-lg font-semibold">Navigation</h2>
                                            <div className="space-y-1">
                                                {routes.map((route) => (
                                                    <Button
                                                        key={route.href}
                                                        variant={route.active ? "secondary" : "ghost"}
                                                        className="w-full justify-start"
                                                        asChild
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <Link href={route.href}>
                                                            <route.icon className="mr-2 h-5 w-5" />
                                                            {route.label}
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Link href="/manager/dashboard" className="flex items-center space-x-2">
                                <span className="font-bold inline-block">Lief Healthcare</span>
                                <span className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">Manager</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5" />
                                <span className="sr-only">Log out</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1">
                    <aside className="hidden w-64 border-r bg-muted/40 md:block">
                        <div className="flex h-full flex-col gap-2 p-4">
                            <div className="flex flex-col gap-1 py-2">
                                {routes.map((route) => (
                                    <Button
                                        key={route.href}
                                        variant={route.active ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={route.href}>
                                            <route.icon className="mr-2 h-5 w-5" />
                                            {route.label}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                            <div className="mt-auto">
                                <div className="rounded-md border bg-card p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            {user?.name?.charAt(0) || "M"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{user?.name || "Manager"}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email || "manager@example.com"}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="mt-4 w-full justify-start" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
                </div>
            </div>
        </ApolloProvider>
    )
}

