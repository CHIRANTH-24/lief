"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client"
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
import { Search, MoreHorizontal, UserPlus, MapPin, Clock, Trash2, Edit2 } from "lucide-react"
import { GET_ALL_STAFF, GET_STAFF_MEMBER, CREATE_STAFF_MEMBER, UPDATE_STAFF_MEMBER, DELETE_STAFF_MEMBER } from "@/graphql/operations/manager"
import { format } from "date-fns"

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
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })

    // Fetch all staff members
    const { loading, error, data, refetch } = useQuery(GET_ALL_STAFF)
    const [createStaff] = useMutation(CREATE_STAFF_MEMBER, {
        onCompleted: () => {
            refetch()
            setIsCreateDialogOpen(false)
            setFormData({ firstName: "", lastName: "", email: "", password: "" })
        }
    })
    const [updateStaff] = useMutation(UPDATE_STAFF_MEMBER, {
        onCompleted: () => {
            refetch()
            setIsEditDialogOpen(false)
            setSelectedStaff(null)
            setFormData({ firstName: "", lastName: "", email: "", password: "" })
        }
    })
    const [deleteStaff] = useMutation(DELETE_STAFF_MEMBER, {
        onCompleted: () => refetch()
    })

    // Handle staff creation
    const handleCreateStaff = async (e) => {
        e.preventDefault()
        try {
            await createStaff({
                variables: {
                    input: {
                        ...formData,
                        role: "CAREWORKER"
                    }
                }
            })
        } catch (error) {
            console.error("Error creating staff member:", error)
        }
    }

    // Handle staff update
    const handleUpdateStaff = async (e) => {
        e.preventDefault()
        try {
            await updateStaff({
                variables: {
                    id: selectedStaff.id,
                    input: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email
                    }
                }
            })
        } catch (error) {
            console.error("Error updating staff member:", error)
        }
    }

    // Handle staff deletion
    const handleDeleteStaff = async (id) => {
        try {
            await deleteStaff({
                variables: { id }
            })
        } catch (error) {
            console.error("Error deleting staff member:", error)
        }
    }

    // Calculate total hours for a staff member
    const calculateTotalHours = (staff) => {
        let totalHours = 0
        staff.shifts.forEach(shift => {
            if (shift.status === "COMPLETED") {
                const startTime = new Date(shift.startTime)
                const endTime = new Date(shift.endTime)
                totalHours += (endTime - startTime) / (1000 * 60 * 60)
            }
        })
        return Math.round(totalHours)
    }

    // Filter staff based on search query
    const filteredStaff = data?.getAllStaff?.filter(
        (staff) =>
            `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    // Separate active and inactive staff
    const activeStaff = filteredStaff.filter((staff) =>
        staff.shifts.some(shift => shift.status === "IN_PROGRESS")
    )
    const inactiveStaff = filteredStaff.filter((staff) =>
        !staff.shifts.some(shift => shift.status === "IN_PROGRESS")
    )

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">View and manage your healthcare staff</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Fill in the details to add a new staff member.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Staff Member</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search staff by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Staff ({activeStaff.length})</CardTitle>
                    <CardDescription>Staff currently on shift</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Current Shift</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Hours This Week</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
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
                                activeStaff.map((staff) => {
                                    const currentShift = staff.shifts.find(shift => shift.status === "IN_PROGRESS")
                                    const lastClockIn = staff.clockIns[0]
                                    return (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">
                                                {staff.firstName} {staff.lastName}
                                            </TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    {currentShift ? format(new Date(currentShift.startTime), "MMM d, h:mm a") : "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    {lastClockIn?.location?.address || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{calculateTotalHours(staff)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedStaff(staff)
                                                            setFormData({
                                                                firstName: staff.firstName,
                                                                lastName: staff.lastName,
                                                                email: staff.email,
                                                                password: ""
                                                            })
                                                            setIsEditDialogOpen(true)
                                                        }}>
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteStaff(staff.id)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inactive Staff ({inactiveStaff.length})</CardTitle>
                    <CardDescription>Staff currently off shift</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Last Shift</TableHead>
                                <TableHead>Hours This Week</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
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
                                inactiveStaff.map((staff) => {
                                    const lastShift = staff.shifts[0]
                                    return (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">
                                                {staff.firstName} {staff.lastName}
                                            </TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    {lastShift ? format(new Date(lastShift.endTime), "MMM d, h:mm a") : "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{calculateTotalHours(staff)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedStaff(staff)
                                                            setFormData({
                                                                firstName: staff.firstName,
                                                                lastName: staff.lastName,
                                                                email: staff.email,
                                                                password: ""
                                                            })
                                                            setIsEditDialogOpen(true)
                                                        }}>
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteStaff(staff.id)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Staff Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                        <DialogDescription>
                            Update staff member details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStaff} className="space-y-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Staff Member</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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

