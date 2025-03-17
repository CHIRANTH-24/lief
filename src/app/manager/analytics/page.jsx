"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week")

    // Mock data for charts
    const dailyClockInsData = [
        { day: "Mon", count: 20, hours: 160 },
        { day: "Tue", count: 18, hours: 144 },
        { day: "Wed", count: 22, hours: 176 },
        { day: "Thu", count: 25, hours: 200 },
        { day: "Fri", count: 24, hours: 192 },
        { day: "Sat", count: 15, hours: 120 },
        { day: "Sun", count: 10, hours: 80 },
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

    const locationData = [
        { name: "Main Building", value: 45 },
        { name: "East Wing", value: 25 },
        { name: "West Wing", value: 20 },
        { name: "South Wing", value: 10 },
    ]

    const COLORS = [
        "hsl(var(--primary))",
        "hsl(var(--primary)/0.8)",
        "hsl(var(--primary)/0.6)",
        "hsl(var(--primary)/0.4)",
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">Detailed insights into staff shifts and activity</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clock-ins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">134</div>
                        <p className="text-xs text-muted-foreground">+12% from last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,072</div>
                        <p className="text-xs text-muted-foreground">+8% from last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Shift Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8.2 hrs</div>
                        <p className="text-xs text-muted-foreground">-0.3 hrs from last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">25</div>
                        <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="staff">Staff Analysis</TabsTrigger>
                    <TabsTrigger value="timing">Timing Insights</TabsTrigger>
                    <TabsTrigger value="location">Location Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Clock-ins & Hours</CardTitle>
                            <CardDescription>Number of clock-ins and total hours by day</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <ChartContainer
                                config={{
                                    count: {
                                        label: "Clock-ins",
                                        color: "hsl(var(--primary))",
                                    },
                                    hours: {
                                        label: "Hours",
                                        color: "hsl(var(--muted))",
                                    },
                                }}
                                className="h-[400px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyClockInsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                                        <YAxis
                                            yAxisId="left"
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: "Clock-ins", angle: -90, position: "insideLeft" }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: "Hours", angle: 90, position: "insideRight" }}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="count"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                            name="Clock-ins"
                                        />
                                        <Bar yAxisId="right" dataKey="hours" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Hours" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
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

                <TabsContent value="location" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clock-ins by Location</CardTitle>
                            <CardDescription>Distribution of clock-ins across locations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={locationData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {locationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

