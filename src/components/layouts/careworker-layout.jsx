"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Home, History, Settings, LogOut, Menu, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth/auth-provider"



export function CareworkerLayout({ children }) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    // const { toast } = useToast()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [location, setLocation] = useState(null)
    const [isWithinPerimeter, setIsWithinPerimeter] = useState(null)

    useEffect(() => {
        // Check if user has location permissions
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lng: longitude })

                    // Mock perimeter check - in a real app, this would check against the manager-set perimeter
                    // For demo, we'll assume the user is within perimeter if latitude is between 40 and 42
                    const within = latitude > 40 && latitude < 42
                    setIsWithinPerimeter(within)
                },
                () => {
                    // toast({
                    //     variant: "destructive",
                    //     title: "Location access denied",
                    //     description: "Please enable location services to use this app",
                    // })
                },
            )
        }
        // }, [toast])

    }, [])

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
            href: "/careworker/dashboard",
            label: "Dashboard",
            icon: Home,
            active: pathname === "/careworker/dashboard",
        },
        {
            href: "/careworker/clock",
            label: "Clock In/Out",
            icon: Clock,
            active: pathname === "/careworker/clock",
        },
        {
            href: "/careworker/history",
            label: "History",
            icon: History,
            active: pathname === "/careworker/history",
        },
        {
            href: "/careworker/settings",
            label: "Settings",
            icon: Settings,
            active: pathname === "/careworker/settings",
        },
    ]

    return (
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
                        <Link href="/careworker/dashboard" className="flex items-center space-x-2">
                            <span className="font-bold inline-block">Lief Healthcare</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        {isWithinPerimeter !== null && (
                            <div
                                className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isWithinPerimeter
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                    }`}
                            >
                                <MapPin className="h-3 w-3" />
                                <span>{isWithinPerimeter ? "Within perimeter" : "Outside perimeter"}</span>
                            </div>
                        )}
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
                            {isWithinPerimeter !== null && (
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md mb-2 ${isWithinPerimeter
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                        }`}
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {isWithinPerimeter ? "Within perimeter" : "Outside perimeter"}
                                    </span>
                                </div>
                            )}
                            <div className="rounded-md border bg-card p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        {user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{user?.name || "User"}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
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
    )
}

