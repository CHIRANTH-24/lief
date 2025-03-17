"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react"

export default function ClockPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    // const { toast } = useToast()

    const action = searchParams.get("action") || "in"
    const isClockIn = action === "in"

    const [location, setLocation] = useState(null)
    const [isWithinPerimeter, setIsWithinPerimeter] = useState(null)
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [clockedIn, setClockedIn] = useState(false)
    const [clockInTime, setClockInTime] = useState(null)

    useEffect(() => {
        // Check if user is already clocked in
        const storedClockInTime = localStorage.getItem("clockInTime")
        if (storedClockInTime) {
            setClockedIn(true)
            setClockInTime(storedClockInTime)
        }

        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lng: longitude })

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
        // }, [toast])

    }, [])

    const handleSubmit = () => {
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            if (isClockIn) {
                // Clock in logic
                if (!isWithinPerimeter) {
                    toast({
                        variant: "destructive",
                        title: "Cannot clock in",
                        description: "You must be within the designated perimeter to clock in",
                    })
                    setIsSubmitting(false)
                    return
                }

                const now = new Date().toISOString()
                localStorage.setItem("clockInTime", now)
                localStorage.setItem("clockInNotes", notes)
                localStorage.setItem("clockInLocation", JSON.stringify(location))

                // toast({
                //     title: "Clocked in successfully",
                //     description: `You clocked in at ${new Date().toLocaleTimeString()}`,
                // })
            } else {
                // Clock out logic
                const clockInTime = localStorage.getItem("clockInTime")
                if (!clockInTime) {
                    // toast({
                    //     variant: "destructive",
                    //     title: "Cannot clock out",
                    //     description: "You are not currently clocked in",
                    // })
                    setIsSubmitting(false)
                    return
                }

                const clockInDate = new Date(clockInTime)
                const clockOutDate = new Date()
                const durationMs = clockOutDate.getTime() - clockInDate.getTime()
                const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
                const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

                // Save shift to history (in a real app, this would be sent to a server)
                const clockInNotes = localStorage.getItem("clockInNotes") || ""
                const clockInLocation = localStorage.getItem("clockInLocation") || "{}"

                const shift = {
                    clockInTime,
                    clockInNotes,
                    clockInLocation,
                    clockOutTime: new Date().toISOString(),
                    clockOutNotes: notes,
                    clockOutLocation: JSON.stringify(location),
                    duration: `${durationHours}h ${durationMinutes}m`,
                }

                // In a real app, we would save this to a database
                const shifts = JSON.parse(localStorage.getItem("shifts") || "[]")
                shifts.unshift(shift)
                localStorage.setItem("shifts", JSON.stringify(shifts))

                // Clear clock in data
                localStorage.removeItem("clockInTime")
                localStorage.removeItem("clockInNotes")
                localStorage.removeItem("clockInLocation")

                // toast({
                //     title: "Clocked out successfully",
                //     description: `Your shift duration: ${durationHours}h ${durationMinutes}m`,
                // })
            }

            setIsSubmitting(false)
            router.push("/careworker/dashboard")
        }, 1500)
    }

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{isClockIn ? "Clock In" : "Clock Out"}</CardTitle>
                    <CardDescription>
                        {isClockIn ? "Record the start of your shift" : "Record the end of your shift"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Current Time</p>
                            <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Location Status</p>
                            <div className="flex items-center mt-1">
                                {isWithinPerimeter === null ? (
                                    <p className="text-sm text-muted-foreground">Checking location...</p>
                                ) : isWithinPerimeter ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        <p className="text-sm text-green-600 dark:text-green-400">Within perimeter</p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600 dark:text-red-400">Outside perimeter</p>
                                    </>
                                )}
                            </div>
                            {location && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium">
                            Notes (Optional)
                        </label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes about your shift..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push("/careworker/dashboard")}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || (isClockIn && !isWithinPerimeter)}>
                        {isSubmitting ? "Processing..." : isClockIn ? "Clock In" : "Clock Out"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

