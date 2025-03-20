import { PrismaClient } from "@prisma/client";
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

// Helper function to check if user is a manager
const ensureManager = (user) => {
  if (!user) throw new GraphQLError("Not authenticated");
  if (user.role !== "MANAGER") throw new GraphQLError("Not authorized. Manager role required.");
};

// Helper function to calculate hours between two dates
const calculateHours = (startTime, endTime) => {
  return (endTime - startTime) / (1000 * 60 * 60);
};

export const managerResolvers = {
  Query: {
    // Get all currently clocked in staff
    getClockedInStaff: async (_, __, { user }) => {
      ensureManager(user);
      
      const clockedInUsers = await prisma.user.findMany({
        where: {
          managerId: user.id,
          clockIns: {
            some: {
              clockOuts: { none: {} } // No corresponding clock out
            }
          }
        },
        include: {
          clockIns: {
            orderBy: { timestamp: 'desc' },
            take: 1,
            include: { location: true }
          }
        }
      });

      return clockedInUsers;
    },

    // Get clock records for all staff
    getStaffClockRecords: async (_, __, { user }) => {
      ensureManager(user);

      const staff = await prisma.user.findMany({
        where: { managerId: user.id },
        include: {
          clockIns: {
            include: { location: true },
            orderBy: { timestamp: 'desc' }
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      return staff.map(staffMember => ({
        user: staffMember,
        clockIns: staffMember.clockIns,
        clockOuts: staffMember.clockOuts
      }));
    },

    // Get daily statistics
    getDailyStats: async (_, { startDate, endDate = new Date() }, { user }) => {
      ensureManager(user);

      const clockEvents = await prisma.clockIn.findMany({
        where: {
          user: { managerId: user.id },
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          clockOuts: true
        }
      });

      let totalHours = 0;
      const validClockEvents = clockEvents.filter(event => event.clockOuts.length > 0);
      
      validClockEvents.forEach(event => {
        totalHours += calculateHours(event.timestamp, event.clockOuts[0].timestamp);
      });

      return {
        date: startDate,
        averageHours: validClockEvents.length > 0 ? totalHours / validClockEvents.length : 0,
        clockInCount: clockEvents.length
      };
    },

    // Get weekly hours per staff member
    getWeeklyStaffHours: async (_, __, { user }) => {
      ensureManager(user);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const staff = await prisma.user.findMany({
        where: { managerId: user.id },
        include: {
          clockIns: {
            where: {
              timestamp: { gte: oneWeekAgo }
            },
            include: { clockOuts: true }
          }
        }
      });

      return staff.map(staffMember => {
        let totalHours = 0;
        
        staffMember.clockIns.forEach(clockIn => {
          if (clockIn.clockOuts.length > 0) {
            totalHours += calculateHours(clockIn.timestamp, clockIn.clockOuts[0].timestamp);
          }
        });

        return {
          user: staffMember,
          totalHours
        };
      });
    }
  },

  Mutation: {
    // Set location perimeter for clock-ins
    setLocationPerimeter: async (_, { input }, { user }) => {
      ensureManager(user);
      const { latitude, longitude, radiusKm } = input;

      try {
        const location = await prisma.location.upsert({
          where: {
            id: user.id
          },
          update: {
            latitude,
            longitude,
            radius: radiusKm,
            address: `Perimeter: ${radiusKm}km radius from (${latitude}, ${longitude})`
          },
          create: {
            id: user.id,
            latitude,
            longitude,
            radius: radiusKm,
            address: `Perimeter: ${radiusKm}km radius from (${latitude}, ${longitude})`
          }
        });

        return location;
      } catch (error) {
        console.error('Error setting location perimeter:', error);
        throw new GraphQLError('Failed to set location perimeter');
      }
    }
  }
};
