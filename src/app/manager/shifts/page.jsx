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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, MoreHorizontal, CalendarIcon, Plus, Trash2, Edit2, Eye } from "lucide-react"
import { format, differenceInHours, differenceInMinutes } from "date-fns"
import { useQuery, useMutation } from "@apollo/client"
import {
    GET_ALL_SHIFTS,
    GET_SHIFT_DETAILS,
    CREATE_SHIFT,
    UPDATE_SHIFT,
    DELETE_SHIFT,
    GET_ALL_STAFF
} from "@/graphql/operations/manager"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function ShiftsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [date, setDate] = useState()
    const [selectedShift, setSelectedShift] = useState(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        userId: "",
        startTime: "",
        endTime: "",
        status: "SCHEDULED"
    })

    // Fetch all shifts
    const { loading: shiftsLoading, error: shiftsError, data: shiftsData } = useQuery(GET_ALL_SHIFTS)

    // Fetch all staff for the create/edit forms
    const { data: staffData } = useQuery(GET_ALL_STAFF)

    // Fetch shift details when viewing a specific shift
    const { data: shiftDetailsData } = useQuery(GET_SHIFT_DETAILS, {
        variables: { id: selectedShift?.id },
        skip: !selectedShift
    })

    // Mutations
    const [createShift] = useMutation(CREATE_SHIFT, {
        refetchQueries: [{ query: GET_ALL_SHIFTS }]
    })

    const [updateShift] = useMutation(UPDATE_SHIFT, {
        refetchQueries: [{ query: GET_ALL_SHIFTS }]
    })

    const [deleteShift] = useMutation(DELETE_SHIFT, {
        refetchQueries: [{ query: GET_ALL_SHIFTS }]
    })

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Validate required fields
            if (!formData.userId || !formData.startTime || !formData.endTime) {
                toast.error("Please fill in all required fields")
                return
            }

            // Format the input data
            const input = {
                userId: formData.userId,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                status: formData.status || "SCHEDULED"
            }

            if (selectedShift) {
                await updateShift({
                    variables: {
                        id: selectedShift.id,
                        input: {
                            startTime: input.startTime,
                            endTime: input.endTime,
                            status: input.status
                        }
                    }
                })
                toast.success("Shift updated successfully")
            } else {
                await createShift({
                    variables: {
                        input
                    }
                })
                toast.success("Shift created successfully")
            }
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setFormData({
                userId: "",
                startTime: "",
                endTime: "",
                status: "SCHEDULED"
            })
        } catch (error) {
            console.error("Error creating/updating shift:", error)
            toast.error(error.message || "Failed to create/update shift")
        }
    }

    // Handle shift deletion
    const handleDelete = async (shiftId) => {
        if (window.confirm("Are you sure you want to delete this shift?")) {
            try {
                await deleteShift({
                    variables: { id: shiftId }
                })
                toast.success("Shift deleted successfully")
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    // Calculate shift duration
    const calculateDuration = (startTime, endTime) => {
        const hours = differenceInHours(new Date(endTime), new Date(startTime))
        const minutes = differenceInMinutes(new Date(endTime), new Date(startTime)) % 60
        return `${hours}h ${minutes}m`
    }

    // Filter shifts based on search query and date
    const filteredShifts = shiftsData?.getAllShifts.filter(shift => {
        const matchesSearch = shift.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shift.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDate = !date || format(new Date(shift.startTime), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        return matchesSearch && matchesDate
    }) || []

    if (shiftsLoading) return <div>Loading...</div>
    if (shiftsError) return <div>Error: {shiftsError.message}</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shift Records</h1>
                    <p className="text-muted-foreground">View and manage all staff shifts</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Shift
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Shift</DialogTitle>
                            <DialogDescription>
                                Fill in the details to create a new shift
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label>Staff Member</label>
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffData?.getAllStaff.map((staff) => (
                                            <SelectItem key={staff.id} value={staff.id}>
                                                {staff.firstName} {staff.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label>Start Time</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label>End Time</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Create Shift
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by staff name..."
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
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        No shifts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredShifts.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {shift.user.firstName} {shift.user.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{shift.user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(shift.startTime), "PPP")}</TableCell>
                                        <TableCell>{format(new Date(shift.startTime), "p")}</TableCell>
                                        <TableCell>{format(new Date(shift.endTime), "p")}</TableCell>
                                        <TableCell>{calculateDuration(shift.startTime, shift.endTime)}</TableCell>
                                        <TableCell>{shift.status}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedShift(shift)
                                                        setIsDetailsDialogOpen(true)
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedShift(shift)
                                                        setFormData({
                                                            userId: shift.userId,
                                                            startTime: format(new Date(shift.startTime), "yyyy-MM-dd'T'HH:mm"),
                                                            endTime: format(new Date(shift.endTime), "yyyy-MM-dd'T'HH:mm"),
                                                            status: shift.status
                                                        })
                                                        setIsEditDialogOpen(true)
                                                    }}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit Shift
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(shift.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Shift
                                                    </DropdownMenuItem>
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

            {/* Shift Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Shift Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the shift
                        </DialogDescription>
                    </DialogHeader>
                    {shiftDetailsData?.getShiftDetails && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Staff Member</h4>
                                <p>
                                    {shiftDetailsData.getShiftDetails.user.firstName}{" "}
                                    {shiftDetailsData.getShiftDetails.user.lastName}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">Schedule</h4>
                                <p>
                                    {format(new Date(shiftDetailsData.getShiftDetails.startTime), "PPP p")} -{" "}
                                    {format(new Date(shiftDetailsData.getShiftDetails.endTime), "p")}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">Duration</h4>
                                <p>
                                    {calculateDuration(
                                        shiftDetailsData.getShiftDetails.startTime,
                                        shiftDetailsData.getShiftDetails.endTime
                                    )}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">Status</h4>
                                <p>{shiftDetailsData.getShiftDetails.status}</p>
                            </div>
                            {shiftDetailsData.getShiftDetails.clockIns.length > 0 && (
                                <div>
                                    <h4 className="font-medium">Clock Ins</h4>
                                    <ul className="list-disc list-inside">
                                        {shiftDetailsData.getShiftDetails.clockIns.map((clockIn) => (
                                            <li key={clockIn.id}>
                                                {format(new Date(clockIn.timestamp), "PPP p")}
                                                {clockIn.location && (
                                                    <span className="text-sm text-muted-foreground">
                                                        {" "}
                                                        at {clockIn.location.address}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {shiftDetailsData.getShiftDetails.clockOuts.length > 0 && (
                                <div>
                                    <h4 className="font-medium">Clock Outs</h4>
                                    <ul className="list-disc list-inside">
                                        {shiftDetailsData.getShiftDetails.clockOuts.map((clockOut) => (
                                            <li key={clockOut.id}>
                                                {format(new Date(clockOut.timestamp), "PPP p")}
                                                {clockOut.location && (
                                                    <span className="text-sm text-muted-foreground">
                                                        {" "}
                                                        at {clockOut.location.address}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Shift Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Shift</DialogTitle>
                        <DialogDescription>
                            Update the shift details
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label>Staff Member</label>
                            <Select
                                value={formData.userId}
                                onValueChange={(value) => setFormData({ ...formData, userId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffData?.getAllStaff.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.firstName} {staff.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label>Start Time</label>
                            <Input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>End Time</label>
                            <Input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Status</label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">
                            Update Shift
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
