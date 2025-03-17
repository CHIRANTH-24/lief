"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, History, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
// import toast from "sooner"

export default function CareworkerDashboard() {
    const router = useRouter()
    // const { toast } = useToast()
    const [isWithinPerimeter, setIsWithinPerimeter] = useState  (null)
    const [clockedIn, setClockedIn] = useState(false)
    const [clockInTime, setClockInTime] = useState  (null)
    const [clockedInDuration, setClockedInDuration] = useState  ("0h 0m")
    const [recentShifts, setRecentShifts] = useState([
        { date: "2023-03-15", clockIn: "08:30 AM", clockOut: "05:30 PM", duration: "9h 0m", notes: "Regular shift" },
        { date: "2023-03-14", clockIn: "09:00 AM", clockOut: "06:00 PM", duration: "9h 0m", notes: "Covered for Jane" },
        { date: "2023-03-13", clockIn: "08:45 AM", clockOut: "04:45 PM", duration: "8h 0m", notes: "" },
    ])

    useEffect(() => {
        // Check if user has location permissions
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude } = position.coords

                    // Mock perimeter check - in a real app, this would check against the manager-set perimeter
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

        // Check if user is already clocked in (from localStorage in this demo)
        const storedClockInTime = localStorage.getItem("clockInTime")
        if (storedClockInTime) {
            setClockedIn(true)
            setClockInTime(storedClockInTime)
        }

        // Update duration timer if clocked in
        const intervalId = setInterval(() => {
            if (clockedIn && clockInTime) {
                const start = new Date(clockInTime).getTime()
                const now = new Date().getTime()
                const diff = now - start

                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

                setClockedInDuration(`${hours}h ${minutes}m`)
            }
        }, 60000) // Update every minute

        return () => clearInterval(intervalId)
    }, [clockedIn, clockInTime])
    // }, [clockedIn, clockInTime,toast])

    const handleClockInOut = () => {
        if (!isWithinPerimeter && !clockedIn) {
            // toast({
            //     variant: "destructive",
            //     title: "Cannot clock in",
            //     description: "You must be within the designated perimeter to clock in",
            // })
            return
        }

        if (clockedIn) {
            // Clock out logic
            router.push("/careworker/clock?action=out")
        } else {
            // Clock in logic
            router.push("/careworker/clock?action=in")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your shifts.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clock Status</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <div className="text-2xl font-bold">{clockedIn ? "Clocked In" : "Clocked Out"}</div>
                            {clockedIn && (
                                <Badge variant="outline" className="w-fit">
                                    Duration: {clockedInDuration}
                                </Badge>
                            )}
                            <Button onClick={handleClockInOut} variant={clockedIn ? "destructive" : "default"} className="mt-2">
                                {clockedIn ? "Clock Out" : "Clock In"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Location Status</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <div className="text-2xl font-bold">
                                {isWithinPerimeter === null
                                    ? "Checking..."
                                    : isWithinPerimeter
                                        ? "Within Perimeter"
                                        : "Outside Perimeter"}
                            </div>
                            <Badge variant={isWithinPerimeter ? "default" : "destructive"} className="w-fit">
                                {isWithinPerimeter ? "OK to Clock In" : "Cannot Clock In"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Shifts</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentShifts.length}</div>
                        <p className="text-xs text-muted-foreground">in the last 7 days</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => router.push("/careworker/history")}
                        >
                            View History
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">unread messages</p>
                        <Button variant="outline" size="sm" className="mt-4 w-full">
                            View All
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Recent Shifts</h2>
                <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                        <div>Date</div>
                        <div>Clock In</div>
                        <div>Clock Out</div>
                        <div>Duration</div>
                        <div>Notes</div>
                    </div>
                    {recentShifts.map((shift, index) => (
                        <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center">
                            <div>{shift.date}</div>
                            <div>{shift.clockIn}</div>
                            <div>{shift.clockOut}</div>
                            <div>{shift.duration}</div>
                            <div>{shift.notes || "-"}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

