"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { Users, Clock, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { toast } from "sonner"

export default function ManagerDashboard() {
    const router = useRouter()

    // Mock data for dashboard
    const [dashboardData, setDashboardData] = useState({
        activeStaff: 18,
        totalStaff: 25,
        shiftsToday: 22,
        hoursToday: 176,
        avgShiftDuration: 8,
        staffOutsidePerimeter: 2,
    })

    // Mock data for charts
    const dailyClockInsData = [
        { day: "Mon", count: 20 },
        { day: "Tue", count: 18 },
        { day: "Wed", count: 22 },
        { day: "Thu", count: 25 },
        { day: "Fri", count: 24 },
        { day: "Sat", count: 15 },
        { day: "Sun", count: 10 },
    ]

    const hourlyDistributionData = [
        { hour: "6-8 AM", count: 8 },
        { hour: "8-10 AM", count: 15 },
        { hour: "10-12 PM", count: 5 },
        { hour: "12-2 PM", count: 3 },
        { hour: "2-4 PM", count: 2 },
        { hour: "4-6 PM", count: 10 },
        { hour: "6-8 PM", count: 5 },
    ]

    const staffHoursData = [
        { name: "John D.", hours: 40 },
        { name: "Sarah M.", hours: 38 },
        { name: "Robert J.", hours: 35 },
        { name: "Emily K.", hours: 32 },
        { name: "Michael P.", hours: 30 },
        { name: "Lisa R.", hours: 28 },
        { name: "David S.", hours: 25 },
        { name: "Anna T.", hours: 20 },
    ]

    const staffStatusData = [
        { name: "Clocked In", value: dashboardData.activeStaff },
        { name: "Clocked Out", value: dashboardData.totalStaff - dashboardData.activeStaff },
    ]

    const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"]

    // Mock active staff data
    const [activeStaff, setActiveStaff] = useState([
        { id: 1, name: "John Doe", position: "Nurse", clockInTime: "08:30 AM", location: "Main Building" },
        { id: 2, name: "Sarah Miller", position: "Caregiver", clockInTime: "09:00 AM", location: "East Wing" },
        { id: 3, name: "Robert Johnson", position: "Nurse", clockInTime: "08:45 AM", location: "West Wing" },
        { id: 4, name: "Emily Kim", position: "Caregiver", clockInTime: "09:15 AM", location: "Main Building" },
        { id: 5, name: "Michael Patel", position: "Nurse", clockInTime: "08:00 AM", location: "South Wing" },
    ])

    const handleStaffError = (error) => {
        toast.error("Staff Error", {
            description: "Failed to fetch staff data: " + error.message
        });
    }

    const handleShiftsError = (error) => {
        toast.error("Shifts Error", {
            description: "Failed to fetch shifts data: " + error.message
        });
    }

    const handleAnalyticsError = (error) => {
        toast.error("Analytics Error", {
            description: "Failed to fetch analytics data: " + error.message
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
                <p className="text-muted-foreground">Overview of staff shifts and activity</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.activeStaff}</div>
                        <p className="text-xs text-muted-foreground">out of {dashboardData.totalStaff} total staff</p>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/manager/staff")}>
                            View Staff
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shifts Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.shiftsToday}</div>
                        <p className="text-xs text-muted-foreground">{dashboardData.hoursToday} total hours</p>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/manager/shifts")}>
                            View Shifts
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Shift Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.avgShiftDuration} hrs</div>
                        <p className="text-xs text-muted-foreground">across all staff</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => router.push("/manager/analytics")}
                        >
                            View Analytics
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outside Perimeter</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.staffOutsidePerimeter}</div>
                        <p className="text-xs text-muted-foreground">staff outside designated area</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => router.push("/manager/perimeter")}
                        >
                            View Map
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="staff">Staff Activity</TabsTrigger>
                    <TabsTrigger value="timing">Timing Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Staff Status</CardTitle>
                                <CardDescription>Current clock in status</CardDescription>
                            </CardHeader>
                            <CardContent className="px-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={staffStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {staffStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Daily Clock-ins</CardTitle>
                                <CardDescription>Last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="px-2">
                                <ChartContainer
                                    config={{
                                        count: {
                                            label: "Clock-ins",
                                            color: "hsl(var(--primary))",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyClockInsData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Currently Active Staff</CardTitle>
                            <CardDescription>Staff currently clocked in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                                    <div>Name</div>
                                    <div>Position</div>
                                    <div>Clock In Time</div>
                                    <div>Location</div>
                                </div>
                                {activeStaff.map((staff) => (
                                    <div key={staff.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 items-center">
                                        <div>{staff.name}</div>
                                        <div>{staff.position}</div>
                                        <div>{staff.clockInTime}</div>
                                        <div>{staff.location}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Hours (Last Week)</CardTitle>
                            <CardDescription>Total hours logged by staff</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <ChartContainer
                                config={{
                                    hours: {
                                        label: "Hours",
                                        color: "hsl(var(--primary))",
                                    },
                                }}
                                className="h-[400px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={staffHoursData} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clock-in Distribution by Hour</CardTitle>
                            <CardDescription>When staff are clocking in</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <ChartContainer
                                config={{
                                    count: {
                                        label: "Clock-ins",
                                        color: "hsl(var(--primary))",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hourlyDistributionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--primary))" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
