"use client"

import { useState } from "react"
import { useMutation } from '@apollo/client';
import { SET_LOCATION_PERIMETER } from '@/graphql/operations/manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MapPin } from "lucide-react"

export default function PerimeterPage() {
    const [perimeter, setPerimeter] = useState({
        latitude: "",
        longitude: "",
        radiusKm: ""
    });

    const [setLocationPerimeter, { loading }] = useMutation(SET_LOCATION_PERIMETER, {
        onCompleted: () => {
            toast.success("Perimeter Updated", {
                description: "The location perimeter has been successfully updated."
            });
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message
            });
        },
    });

    const getCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPerimeter({
                        ...perimeter,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    });
                },
                (error) => {
                    toast.error("Location Error", {
                        description: "Unable to get current location. Please enter coordinates manually."
                    });
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const input = {
            latitude: parseFloat(perimeter.latitude),
            longitude: parseFloat(perimeter.longitude),
            radiusKm: parseFloat(perimeter.radiusKm)
        };

        if (isNaN(input.latitude) || isNaN(input.longitude) || isNaN(input.radiusKm)) {
            toast.error("Invalid Input", {
                description: "Please enter valid numbers for all fields."
            });
            return;
        }

        try {
            await setLocationPerimeter({
                variables: { input }
            });
        } catch (error) {
            console.error('Error setting perimeter:', error);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Location Perimeter</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Set Clock-in Perimeter</CardTitle>
                    <CardDescription>
                        Define the area where staff members are allowed to clock in. Staff can only clock in when they are within this perimeter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="location">Location Coordinates</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={getCurrentLocation}
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Use Current Location
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        placeholder="e.g. 51.5074"
                                        value={perimeter.latitude}
                                        onChange={(e) => setPerimeter({ ...perimeter, latitude: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        placeholder="e.g. -0.1278"
                                        value={perimeter.longitude}
                                        onChange={(e) => setPerimeter({ ...perimeter, longitude: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="radius">Perimeter Radius (km)</Label>
                            <Input
                                id="radius"
                                placeholder="e.g. 2"
                                value={perimeter.radiusKm}
                                onChange={(e) => setPerimeter({ ...perimeter, radiusKm: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Updating..." : "Set Perimeter"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
