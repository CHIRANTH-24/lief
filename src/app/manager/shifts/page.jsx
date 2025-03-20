"use client"

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_STAFF_SHIFTS, CREATE_SHIFT, UPDATE_SHIFT, DELETE_SHIFT } from '@/graphql/operations/manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, MoreHorizontal, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ShiftsPage() {
    const { loading: shiftsLoading, error: shiftsError, data: shiftsData } = useQuery(GET_STAFF_SHIFTS, {
        onError: (error) => {
            toast.error("Shifts Error", {
                description: "Failed to fetch staff shifts: " + error.message
            });
        }
    });

    const [createShift] = useMutation(CREATE_SHIFT, {
        onCompleted: () => {
            toast.success("Shift Created", {
                description: "New shift has been successfully created."
            });
        },
        onError: (error) => {
            toast.error("Create Error", {
                description: "Failed to create shift: " + error.message
            });
        },
        refetchQueries: [{ query: GET_STAFF_SHIFTS }]
    });

    const [updateShift] = useMutation(UPDATE_SHIFT, {
        onCompleted: () => {
            toast.success("Shift Updated", {
                description: "Shift has been successfully updated."
            });
        },
        onError: (error) => {
            toast.error("Update Error", {
                description: "Failed to update shift: " + error.message
            });
        },
        refetchQueries: [{ query: GET_STAFF_SHIFTS }]
    });

    const [deleteShift] = useMutation(DELETE_SHIFT, {
        onCompleted: () => {
            toast.success("Shift Deleted", {
                description: "Shift has been successfully deleted."
            });
        },
        onError: (error) => {
            toast.error("Delete Error", {
                description: "Failed to delete shift: " + error.message
            });
        },
        refetchQueries: [{ query: GET_STAFF_SHIFTS }]
    });

    const [searchQuery, setSearchQuery] = useState("")
    const [date, setDate] = useState()

    const shifts = shiftsData?.staffShifts || []

    const filteredShifts = shifts.filter(
        (shift) =>
            (shift.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                shift.position.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (!date || shift.date === format(date, "yyyy-MM-dd")),
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Shift Records</h1>
                <p className="text-muted-foreground">View and manage all staff shifts</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by staff name or position..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left sm:w-auto">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Filter by date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>

                    {date && (
                        <Button variant="ghost" size="sm" onClick={() => setDate(undefined)} className="w-full sm:w-auto">
                            Clear filter
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Shifts</CardTitle>
                    <CardDescription>Showing {filteredShifts.length} shift records</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">
                                        No shifts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredShifts.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{shift.staffName}</div>
                                                <div className="text-sm text-muted-foreground">{shift.position}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{shift.date}</TableCell>
                                        <TableCell>{shift.clockInTime}</TableCell>
                                        <TableCell>{shift.clockOutTime}</TableCell>
                                        <TableCell>{shift.duration}</TableCell>
                                        <TableCell>{shift.location}</TableCell>
                                        <TableCell>{shift.notes || "-"}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Export Record</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit Notes</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
