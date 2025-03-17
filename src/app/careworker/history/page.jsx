"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



export default function HistoryPage() {
    const [shifts, setShifts] = useState ([])
    const [filteredShifts, setFilteredShifts] = useState ([])
    const [dateFilter, setDateFilter] = useState("")
    const [sortOrder, setSortOrder] = useState  ("desc")

    useEffect(() => {
        // Load shifts from localStorage (in a real app, this would come from an API)
        const storedShifts = JSON.parse(localStorage.getItem("shifts") || "[]")

        // Add some mock data if no shifts exist
        if (storedShifts.length === 0) {
            const mockShifts = [
                {
                    clockInTime: new Date("2023-03-15T08:30:00").toISOString(),
                    clockOutTime: new Date("2023-03-15T17:30:00").toISOString(),
                    clockInNotes: "Regular shift",
                    clockOutNotes: "",
                    duration: "9h 0m",
                },
                {
                    clockInTime: new Date("2023-03-14T09:00:00").toISOString(),
                    clockOutTime: new Date("2023-03-14T18:00:00").toISOString(),
                    clockInNotes: "Covered for Jane",
                    clockOutNotes: "Handover completed",
                    duration: "9h 0m",
                },
                {
                    clockInTime: new Date("2023-03-13T08:45:00").toISOString(),
                    clockOutTime: new Date("2023-03-13T16:45:00").toISOString(),
                    clockInNotes: "",
                    clockOutNotes: "",
                    duration: "8h 0m",
                },
            ]
            setShifts(mockShifts)
            setFilteredShifts(mockShifts)
        } else {
            setShifts(storedShifts)
            setFilteredShifts(storedShifts)
        }
    }, [])

    useEffect(() => {
        // Apply filters and sorting
        let result = [...shifts]

        // Apply date filter
        if (dateFilter) {
            result = result.filter((shift) => new Date(shift.clockInTime).toLocaleDateString().includes(dateFilter))
        }

        // Apply sorting
        result.sort((a, b) => {
            const dateA = new Date(a.clockInTime).getTime()
            const dateB = new Date(b.clockInTime).getTime()
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA
        })

        setFilteredShifts(result)
    }, [shifts, dateFilter, sortOrder])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString()
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Shift History</h1>
                <p className="text-muted-foreground">View and filter your past shifts</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Narrow down your shift history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date Filter</Label>
                            <Input
                                id="date"
                                placeholder="Filter by date..."
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort">Sort Order</Label>
                            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                                <SelectTrigger id="sort">
                                    <SelectValue placeholder="Select sort order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Newest First</SelectItem>
                                    <SelectItem value="asc">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shift Records</CardTitle>
                    <CardDescription>Showing {filteredShifts.length} shifts</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No shifts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredShifts.map((shift, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{formatDate(shift.clockInTime)}</TableCell>
                                        <TableCell>{formatTime(shift.clockInTime)}</TableCell>
                                        <TableCell>{formatTime(shift.clockOutTime)}</TableCell>
                                        <TableCell>{shift.duration}</TableCell>
                                        <TableCell>
                                            {shift.clockInNotes && (
                                                <div className="text-xs">
                                                    <span className="font-medium">In:</span> {shift.clockInNotes}
                                                </div>
                                            )}
                                            {shift.clockOutNotes && (
                                                <div className="text-xs">
                                                    <span className="font-medium">Out:</span> {shift.clockOutNotes}
                                                </div>
                                            )}
                                            {!shift.clockInNotes && !shift.clockOutNotes && "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

