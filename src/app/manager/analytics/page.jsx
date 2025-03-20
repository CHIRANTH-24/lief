"use client"

import { useEffect, useState } from "react"
import { useQuery } from '@apollo/client';
import { GET_DAILY_STATS, GET_WEEKLY_STAFF_HOURS } from '@/graphql/operations/manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        to: new Date()
    });

    const { data: dailyStatsData, loading: dailyStatsLoading, error: dailyStatsError } = useQuery(GET_DAILY_STATS, {
        variables: {
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString()
        },
        onError: (error) => {
            toast.error("Statistics Error", {
                description: "Failed to fetch daily statistics: " + error.message
            });
        }
    });

    const { data: weeklyHoursData, loading: weeklyHoursLoading, error: weeklyHoursError } = useQuery(GET_WEEKLY_STAFF_HOURS, {
        onError: (error) => {
            toast.error("Hours Error", {
                description: "Failed to fetch weekly staff hours: " + error.message
            });
        }
    });

    const handleDateChange = (newRange) => {
        if (!newRange.from || !newRange.to) {
            toast.error("Invalid Date Range", {
                description: "Please select both start and end dates"
            });
            return;
        }
        setDateRange(newRange);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <div className="flex items-center space-x-2">
                    <CalendarDateRangePicker
                        date={dateRange}
                        onDateChange={handleDateChange}
                    />
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="staff-hours">Staff Hours</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Average Hours Per Day</CardTitle>
                                <CardDescription>
                                    Average time staff spend clocked in
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dailyStatsLoading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="text-2xl font-bold">
                                        {dailyStatsData?.getDailyStats.averageHours.toFixed(1)} hours
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Clock-ins</CardTitle>
                                <CardDescription>
                                    Number of staff clocking in today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dailyStatsLoading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="text-2xl font-bold">
                                        {dailyStatsData?.getDailyStats.clockInCount}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="staff-hours" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Staff Hours</CardTitle>
                            <CardDescription>
                                Total hours worked by each staff member in the last week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weeklyHoursLoading ? (
                                <div>Loading...</div>
                            ) : (
                                <div className="space-y-8">
                                    {weeklyHoursData?.getWeeklyStaffHours.map((staffHours) => (
                                        <div key={staffHours.user.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {staffHours.user.firstName} {staffHours.user.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {staffHours.totalHours.toFixed(1)} hours this week
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {(staffHours.totalHours / 40 * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
