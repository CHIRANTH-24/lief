"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPin, Save } from "lucide-react"
// import { toast } from "sooner"

export default function PerimeterPage() {
    
    const [centerLocation, setCenterLocation] = useState({
        lat: 40.712776,
        lng: -74.005974,
    })
    const [radius, setRadius] = useState(2)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSavePerimeter = () => {
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            // In a real app, this would save to a database
            localStorage.setItem(
                "perimeter",
                JSON.stringify({
                    center: centerLocation,
                    radius,
                }),
            )

            toast({
                title: "Perimeter saved",
                description: `Set to ${radius} km radius around the specified location`,
            })

            setIsSubmitting(false)
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Location Perimeter</h1>
                <p className="text-muted-foreground">Set the allowed area for staff to clock in</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Perimeter Settings</CardTitle>
                        <CardDescription>Define the center point and radius for the clock-in perimeter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="0.000001"
                                value={centerLocation.lat}
                                onChange={(e) =>
                                    setCenterLocation({
                                        ...centerLocation,
                                        lat: Number.parseFloat(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="0.000001"
                                value={centerLocation.lng}
                                onChange={(e) =>
                                    setCenterLocation({
                                        ...centerLocation,
                                        lng: Number.parseFloat(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="radius">Radius (km)</Label>
                                <span className="text-sm text-muted-foreground">{radius} km</span>
                            </div>
                            <Slider
                                id="radius"
                                min={0.1}
                                max={10}
                                step={0.1}
                                value={[radius]}
                                onValueChange={(value) => setRadius(value[0])}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSavePerimeter} disabled={isSubmitting}>
                            {isSubmitting ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Perimeter
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Perimeter Visualization</CardTitle>
                        <CardDescription>Visual representation of the clock-in perimeter</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-[300px] w-full bg-slate-100 rounded-md overflow-hidden">
                            {/* Simple map visualization */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-muted-foreground">Map Visualization</div>
                            </div>

                            {/* Center point */}
                            <div
                                className="absolute rounded-full bg-primary"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                    width: "10px",
                                    height: "10px",
                                    transform: "translate(-50%, -50%)",
                                }}
                            />

                            {/* Perimeter circle */}
                            <div
                                className="absolute rounded-full border-2 border-primary"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                    width: `${radius * 30}px`,
                                    height: `${radius * 30}px`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        </div>
                        <div className="mt-4 text-sm text-center text-muted-foreground">
                            <div className="flex items-center justify-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>
                                    Center: {centerLocation.lat.toFixed(6)}, {centerLocation.lng.toFixed(6)}
                                </span>
                            </div>
                            <div className="mt-1">
                                Radius: {radius} km (approximately {(radius * 0.621371).toFixed(2)} miles)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Outside Perimeter</CardTitle>
                    <CardDescription>Staff who have attempted to clock in from outside the perimeter</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                            <div>Name</div>
                            <div>Attempt Time</div>
                            <div>Location</div>
                            <div>Distance from Perimeter</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4 border-b">
                            <div>Alice Green</div>
                            <div>Today, 08:45 AM</div>
                            <div>40.723776, -74.015974</div>
                            <div>1.2 km</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                            <div>Tom Wilson</div>
                            <div>Today, 09:15 AM</div>
                            <div>40.702776, -73.995974</div>
                            <div>0.8 km</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

