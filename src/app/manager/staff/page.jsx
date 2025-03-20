"use client"

import { useState, useEffect } from "react"
import { useQuery } from '@apollo/client';
import { GET_CLOCKED_IN_STAFF, GET_STAFF_CLOCK_RECORDS } from '@/graphql/operations/manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { toast } from "sonner"

export default function StaffPage() {
    const [searchQuery, setSearchQuery] = useState("")
    
    // Fetch currently clocked in staff
    const { data: clockedInData, loading: clockedInLoading, error: clockedInError } = useQuery(GET_CLOCKED_IN_STAFF, {
        pollInterval: 30000, // Poll every 30 seconds for updates
        onError: (error) => {
            toast.error("Error", {
                description: "Failed to fetch clocked-in staff: " + error.message
            });
        }
    });

    // Fetch all staff clock records
    const { data: clockRecordsData, loading: clockRecordsLoading, error: clockRecordsError } = useQuery(GET_STAFF_CLOCK_RECORDS, {
        onError: (error) => {
            toast.error("Error", {
                description: "Failed to fetch staff records: " + error.message
            });
        }
    });

    // Filter staff based on search query
    const filteredStaff = clockRecordsData?.getStaffClockRecords.filter(record => 
        record.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getLatestLocation = (record) => {
        const location = record?.location;
        return location ? `${location.address || `(${location.latitude}, ${location.longitude})`}` : 'N/A';
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
            </div>

            {/* Currently Clocked In Staff */}
            <Card>
                <CardHeader>
                    <CardTitle>Currently Clocked In Staff</CardTitle>
                    <CardDescription>Staff members who are currently on duty</CardDescription>
                </CardHeader>
                <CardContent>
                    {clockedInLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Clock In Time</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clockedInData?.getClockedInStaff.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell>{staff.firstName} {staff.lastName}</TableCell>
                                        <TableCell>{formatDateTime(staff.clockIns[0]?.timestamp)}</TableCell>
                                        <TableCell>{getLatestLocation(staff.clockIns[0])}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Staff Clock Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Clock Records</CardTitle>
                    <CardDescription>Complete clock in/out history for all staff</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {clockRecordsLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Last Clock In</TableHead>
                                    <TableHead>Last Clock Out</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStaff.map((record) => (
                                    <TableRow key={record.user.id}>
                                        <TableCell>{record.user.firstName} {record.user.lastName}</TableCell>
                                        <TableCell>
                                            {record.clockIns[0] ? formatDateTime(record.clockIns[0].timestamp) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {record.clockOuts[0] ? formatDateTime(record.clockOuts[0].timestamp) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {record.clockIns[0] ? getLatestLocation(record.clockIns[0]) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
