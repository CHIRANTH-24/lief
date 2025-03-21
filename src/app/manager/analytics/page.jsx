"use client"

import { useState, useEffect } from "react"
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
import { useQuery } from "@apollo/client"
import {
    GET_ANALYTICS_OVERVIEW,
    GET_DAILY_STATS,
    GET_WEEKLY_STAFF_HOURS,
    GET_HOURLY_DISTRIBUTION,
    GET_LOCATION_DISTRIBUTION
} from "@/graphql/operations/manager"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { toast } from "sonner"

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week")
    const [dateRange, setDateRange] = useState({
        startDate: startOfDay(subDays(new Date(), 7)),
        endDate: endOfDay(new Date())
    })

    // Fetch analytics overview
    const { data: overviewData, loading: overviewLoading } = useQuery(GET_ANALYTICS_OVERVIEW, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }
    })

    // Fetch daily stats
    const { data: dailyStatsData, loading: dailyStatsLoading } = useQuery(GET_DAILY_STATS, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }
    })

    // Fetch weekly staff hours
    const { data: staffHoursData, loading: staffHoursLoading } = useQuery(GET_WEEKLY_STAFF_HOURS)

    // Fetch hourly distribution
    const { data: hourlyDistributionData, loading: hourlyDistributionLoading } = useQuery(GET_HOURLY_DISTRIBUTION, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }
    })

    // Fetch location distribution
    const { data: locationData, loading: locationLoading } = useQuery(GET_LOCATION_DISTRIBUTION, {
        variables: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }
    })

    // Handle time range changes
    useEffect(() => {
        const now = new Date()
        let startDate = new Date()

        switch (timeRange) {
            case "day":
                startDate = subDays(now, 1)
                break
            case "week":
                startDate = subDays(now, 7)
                break
            case "month":
                startDate = subDays(now, 30)
                break
            case "quarter":
                startDate = subDays(now, 90)
                break
        }

        setDateRange({
            startDate: startOfDay(startDate),
            endDate: endOfDay(now)
        })
    }, [timeRange])

    const COLORS = [
        "hsl(var(--primary))",
        "hsl(var(--primary)/0.8)",
        "hsl(var(--primary)/0.6)",
        "hsl(var(--primary)/0.4)",
    ]

    if (overviewLoading || dailyStatsLoading || staffHoursLoading || hourlyDistributionLoading || locationLoading) {
        return <div>Loading...</div>
    }

    const overview = overviewData?.getAnalyticsOverview || {
        totalClockIns: 0,
        totalHours: 0,
        averageShiftDuration: 0,
        uniqueStaffCount: 0,
        previousPeriodComparison: {
            clockInsChange: 0,
            hoursChange: 0,
            durationChange: 0,
            staffChange: 0
        }
    }

    const staffHours = staffHoursData?.getWeeklyStaffHours || []
    const hourlyDistribution = hourlyDistributionData?.getHourlyDistribution || []
    const locationDistribution = locationData?.getLocationDistribution || []

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
                        <div className="text-2xl font-bold">{overview.totalClockIns}</div>
                        <p className="text-xs text-muted-foreground">
                            {overview.previousPeriodComparison.clockInsChange > 0 ? '+' : ''}
                            {overview.previousPeriodComparison.clockInsChange.toFixed(1)}% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview.totalHours.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            {overview.previousPeriodComparison.hoursChange > 0 ? '+' : ''}
                            {overview.previousPeriodComparison.hoursChange.toFixed(1)}% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Shift Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview.averageShiftDuration.toFixed(1)} hrs</div>
                        <p className="text-xs text-muted-foreground">
                            {overview.previousPeriodComparison.durationChange > 0 ? '+' : ''}
                            {overview.previousPeriodComparison.durationChange.toFixed(1)}% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview.uniqueStaffCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {overview.previousPeriodComparison.staffChange > 0 ? '+' : ''}
                            {overview.previousPeriodComparison.staffChange.toFixed(1)}% from last period
                        </p>
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
                                    <BarChart data={dailyStatsData?.getDailyStats || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
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
                                            dataKey="clockInCount"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                            name="Clock-ins"
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="averageHours"
                                            fill="hsl(var(--muted))"
                                            radius={[4, 4, 0, 0]}
                                            name="Hours"
                                        />
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
                                    <BarChart data={staffHours} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickLine={false} axisLine={false} />
                                        <YAxis
                                            dataKey="user.firstName"
                                            type="category"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="totalHours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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
                                    <LineChart data={hourlyDistribution}>
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
                                            data={locationDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {locationDistribution.map((entry, index) => (
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
