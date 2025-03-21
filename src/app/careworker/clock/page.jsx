"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { CHECK_LOCATION_PERIMETER, CLOCK_IN, CLOCK_OUT, GET_CURRENT_SHIFT } from "@/graphql/operations/careworker"
import { toast } from "sonner"

function ClockComponent() {
    const searchParams = useSearchParams() 
    const router = useRouter()

    const action = searchParams.get("action") || "in"
    const isClockIn = action === "in"

    const [location, setLocation] = useState(null)
    const [isWithinPerimeter, setIsWithinPerimeter] = useState(null)
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // GraphQL Operations
    const { data: currentShiftData } = useQuery(GET_CURRENT_SHIFT, {
        pollInterval: 5000, // Poll every 5 seconds to keep shift status updated
    })

    const [clockIn] = useMutation(CLOCK_IN, {
        onCompleted: () => {
            toast.success("Clock In Successful", {
                description: "Your shift has started."
            })
            router.push("/careworker/dashboard")
        },
        onError: (error) => {
            toast.error("Clock In Failed", {
                description: error.message
            })
            setIsSubmitting(false)
        },
    })

    const [clockOut] = useMutation(CLOCK_OUT, {
        onCompleted: () => {
            toast.success("Clock Out Successful", {
                description: "Your shift has ended."
            })
            router.push("/careworker/dashboard")
        },
        onError: (error) => {
            toast.error("Clock Out Failed", {
                description: error.message
            })
            setIsSubmitting(false)
        },
    })

    const { data: perimeterData, loading: checkingPerimeter } = useQuery(CHECK_LOCATION_PERIMETER, {
        variables: {
            input: location ? {
                latitude: location.lat,
                longitude: location.lng
            } : null
        },
        skip: !location,
        pollInterval: 30000, // Check perimeter every 30 seconds
    })

    useEffect(() => {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lng: longitude })
                },
                (error) => {
                    toast.error("Location Error", {
                        description: "Unable to access location. Please enable location services."
                    })
                },
            )
        }
    }, [location])

    // Update perimeter status when data changes
    useEffect(() => {
        if (perimeterData?.checkLocationPerimeter) {
            setIsWithinPerimeter(perimeterData.checkLocationPerimeter.isWithinPerimeter)
        }
    }, [perimeterData])

    const handleSubmit = async () => {
        setIsSubmitting(true)

        const locationInput = {
            latitude: location.lat,
            longitude: location.lng,
            address: perimeterData?.checkLocationPerimeter?.nearestLocation?.address || "Unknown"
        }

        try {
            if (isClockIn) {
                if (!isWithinPerimeter) {
                    toast.error("Cannot Clock In", {
                        description: "You must be within the designated work area to clock in."
                    })
                    setIsSubmitting(false)
                    return
                }

                await clockIn({
                    variables: {
                        input: {
                            location: locationInput,
                            notes
                        }
                    }
                })
            } else {
                await clockOut({
                    variables: {
                        input: {
                            location: locationInput,
                            notes
                        }
                    }
                })
            }
        } catch (error) {
            console.error("Error during clock operation:", error)
            setIsSubmitting(false)
        }
    }

    // Calculate shift duration if clocked in
    const shiftDuration = currentShiftData?.currentShift ? {
        hours: Math.floor((Date.now() - new Date(currentShiftData.currentShift.startTime).getTime()) / (1000 * 60 * 60)),
        minutes: Math.floor(((Date.now() - new Date(currentShiftData.currentShift.startTime).getTime()) % (1000 * 60 * 60)) / (1000 * 60))
    } : null

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
                            {!isClockIn && shiftDuration && (
                                <p className="text-sm text-muted-foreground">
                                    Shift Duration: {shiftDuration.hours}h {shiftDuration.minutes}m
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Location Status</p>
                            <div className="flex items-center mt-1">
                                {checkingPerimeter ? (
                                    <p className="text-sm text-muted-foreground">Checking location...</p>
                                ) : isWithinPerimeter ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        <p className="text-sm text-green-600 dark:text-green-400">Within work area</p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600 dark:text-red-400">Outside work area</p>
                                    </>
                                )}
                            </div>
                            {location && perimeterData?.checkLocationPerimeter?.nearestLocation && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Nearest Location: {perimeterData.checkLocationPerimeter.nearestLocation.address}
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
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || (isClockIn && !isWithinPerimeter) || checkingPerimeter}
                    >
                        {isSubmitting ? "Processing..." : isClockIn ? "Clock In" : "Clock Out"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ClockPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClockComponent />
        </Suspense>
    )
}
