"use client"


import { useState } from "react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Search, MoreHorizontal, UserPlus, MapPin } from "lucide-react"

// type StaffMember = {
//     id: number
//     name: string
//     position: string
//     status: "active" | "inactive"
//     clockInTime?: string
//     clockOutTime?: string
//     location?: string
//     hoursThisWeek: number
// }

export default function StaffPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [staffMembers, setStaffMembers] = useState([
        {
            id: 1,
            name: "John Doe",
            position: "Nurse",
            status: "active",
            clockInTime: "08:30 AM",
            location: "Main Building",
            hoursThisWeek: 32,
        },
        {
            id: 2,
            name: "Sarah Miller",
            position: "Caregiver",
            status: "active",
            clockInTime: "09:00 AM",
            location: "East Wing",
            hoursThisWeek: 28,
        },
        {
            id: 3,
            name: "Robert Johnson",
            position: "Nurse",
            status: "active",
            clockInTime: "08:45 AM",
            location: "West Wing",
            hoursThisWeek: 35,
        },
        {
            id: 4,
            name: "Emily Kim",
            position: "Caregiver",
            status: "active",
            clockInTime: "09:15 AM",
            location: "Main Building",
            hoursThisWeek: 30,
        },
        {
            id: 5,
            name: "Michael Patel",
            position: "Nurse",
            status: "active",
            clockInTime: "08:00 AM",
            location: "South Wing",
            hoursThisWeek: 38,
        },
        {
            id: 6,
            name: "Lisa Rodriguez",
            position: "Caregiver",
            status: "inactive",
            clockOutTime: "Yesterday, 06:30 PM",
            hoursThisWeek: 24,
        },
        {
            id: 7,
            name: "David Smith",
            position: "Nurse",
            status: "inactive",
            clockOutTime: "Yesterday, 05:45 PM",
            hoursThisWeek: 40,
        },
        {
            id: 8,
            name: "Anna Thompson",
            position: "Caregiver",
            status: "inactive",
            clockOutTime: "Yesterday, 06:15 PM",
            hoursThisWeek: 22,
        },
    ])

    const filteredStaff = staffMembers.filter(
        (staff) =>
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.position.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const activeStaff = filteredStaff.filter((staff) => staff.status === "active")
    const inactiveStaff = filteredStaff.filter((staff) => staff.status === "inactive")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">View and manage your healthcare staff</p>
                </div>
                
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search staff by name or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Staff ({activeStaff.length})</CardTitle>
                    <CardDescription>Staff currently clocked in</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Hours This Week</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        No active staff found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activeStaff.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.position}</TableCell>
                                        <TableCell>{staff.clockInTime}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                                {staff.location}
                                            </div>
                                        </TableCell>
                                        <TableCell>{staff.hoursThisWeek}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inactive Staff ({inactiveStaff.length})</CardTitle>
                    <CardDescription>Staff currently clocked out</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Last Clock Out</TableHead>
                                <TableHead>Hours This Week</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inactiveStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No inactive staff found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inactiveStaff.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.position}</TableCell>
                                        <TableCell>{staff.clockOutTime}</TableCell>
                                        <TableCell>{staff.hoursThisWeek}</TableCell>
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

function Label({ className, ...props }) {
    return (
        <label
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
            {...props}
        />
    )
}

