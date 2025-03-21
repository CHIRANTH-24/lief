import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

// Helper function to check if user is a manager
const ensureManager = (user) => {
  if (!user) throw new GraphQLError("Not authenticated");
  if (user.role !== "MANAGER")
    throw new GraphQLError("Not authorized. Manager role required.");
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
              clockOuts: { none: {} }, // No corresponding clock out
            },
          },
        },
        include: {
          clockIns: {
            orderBy: { timestamp: "desc" },
            take: 1,
            include: { location: true },
          },
        },
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
            orderBy: { timestamp: "desc" },
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
        },
      });

      return staff.map((staffMember) => ({
        user: staffMember,
        clockIns: staffMember.clockIns,
        clockOuts: staffMember.clockOuts,
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
            lte: endDate,
          },
        },
        include: {
          clockOuts: true,
        },
      });

      let totalHours = 0;
      const validClockEvents = clockEvents.filter(
        (event) => event.clockOuts.length > 0
      );

      validClockEvents.forEach((event) => {
        totalHours += calculateHours(
          event.timestamp,
          event.clockOuts[0].timestamp
        );
      });

      return {
        date: startDate,
        averageHours:
          validClockEvents.length > 0
            ? totalHours / validClockEvents.length
            : 0,
        clockInCount: clockEvents.length,
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
              timestamp: { gte: oneWeekAgo },
            },
            include: { clockOuts: true },
          },
        },
      });

      return staff.map((staffMember) => {
        let totalHours = 0;

        staffMember.clockIns.forEach((clockIn) => {
          if (clockIn.clockOuts.length > 0) {
            totalHours += calculateHours(
              clockIn.timestamp,
              clockIn.clockOuts[0].timestamp
            );
          }
        });

        return {
          user: staffMember,
          totalHours,
        };
      });
    },

    // Get all staff members
    getAllStaff: async (_, __, { user }) => {
      ensureManager(user);

      const staff = await prisma.user.findMany({
        where: { managerId: user.id },
        include: {
          shifts: {
            orderBy: { startTime: "desc" },
          },
          clockIns: {
            orderBy: { timestamp: "desc" },
            take: 1,
            include: { location: true },
          },
          clockOuts: {
            orderBy: { timestamp: "desc" },
            take: 1,
            include: { location: true },
          },
        },
      });

      return staff;
    },

    // Get staff member details
    getStaffMember: async (_, { id }, { user }) => {
      ensureManager(user);

      const staffMember = await prisma.user.findFirst({
        where: {
          id,
          managerId: user.id,
        },
        include: {
          shifts: {
            orderBy: { startTime: "desc" },
          },
          clockIns: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
        },
      });

      if (!staffMember) {
        throw new GraphQLError("Staff member not found");
      }

      return staffMember;
    },

    // Get all shifts
    getAllShifts: async (_, __, { user }) => {
      ensureManager(user);

      const shifts = await prisma.shift.findMany({
        where: {
          user: {
            managerId: user.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          clockIns: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
        },
        orderBy: { startTime: "desc" },
      });

      return shifts;
    },

    // Get shift details
    getShiftDetails: async (_, { id }, { user }) => {
      ensureManager(user);

      const shift = await prisma.shift.findFirst({
        where: {
          id,
          user: {
            managerId: user.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          clockIns: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
        },
      });

      if (!shift) {
        throw new GraphQLError("Shift not found");
      }

      return shift;
    },

    // Get staff shifts
    getStaffShifts: async (_, { userId }, { user }) => {
      ensureManager(user);

      const staffMember = await prisma.user.findFirst({
        where: {
          id: userId,
          managerId: user.id,
        },
      });

      if (!staffMember) {
        throw new GraphQLError("Staff member not found");
      }

      const shifts = await prisma.shift.findMany({
        where: {
          userId,
        },
        include: {
          clockIns: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
          clockOuts: {
            include: { location: true },
            orderBy: { timestamp: "desc" },
          },
        },
        orderBy: { startTime: "desc" },
      });

      return shifts;
    },
  },

  Mutation: {
    // Set location perimeter for clock-ins
    setLocationPerimeter: async (_, { input }, { user }) => {
      ensureManager(user);
      const { latitude, longitude, radiusKm } = input;

      try {
        const location = await prisma.location.upsert({
          where: {
            id: user.id,
          },
          update: {
            latitude,
            longitude,
            radius: radiusKm,
            address: `Perimeter: ${radiusKm}km radius from (${latitude}, ${longitude})`,
          },
          create: {
            id: user.id,
            latitude,
            longitude,
            radius: radiusKm,
            address: `Perimeter: ${radiusKm}km radius from (${latitude}, ${longitude})`,
          },
        });

        return location;
      } catch (error) {
        console.error("Error setting location perimeter:", error);
        throw new GraphQLError("Failed to set location perimeter");
      }
    },

    // Create new staff member
    createStaffMember: async (_, { input }, { user }) => {
      ensureManager(user);

      try {
        const staffMember = await prisma.user.create({
          data: {
            ...input,
            managerId: user.id,
            role: "CAREWORKER", // Force role to be CAREWORKER for staff members
          },
        });

        return staffMember;
      } catch (error) {
        console.error("Error creating staff member:", error);
        throw new GraphQLError("Failed to create staff member");
      }
    },

    // Update staff member
    updateStaffMember: async (_, { id, input }, { user }) => {
      ensureManager(user);

      try {
        const staffMember = await prisma.user.update({
          where: {
            id,
            managerId: user.id,
          },
          data: input,
        });

        return staffMember;
      } catch (error) {
        console.error("Error updating staff member:", error);
        throw new GraphQLError("Failed to update staff member");
      }
    },

    // Delete staff member
    deleteStaffMember: async (_, { id }, { user }) => {
      ensureManager(user);

      try {
        await prisma.user.delete({
          where: {
            id,
            managerId: user.id,
          },
        });

        return true;
      } catch (error) {
        console.error("Error deleting staff member:", error);
        throw new GraphQLError("Failed to delete staff member");
      }
    },

    // Create shift
    createShift: async (_, { input }, { user }) => {
      ensureManager(user);

      try {
        // Verify the staff member belongs to this manager
        const staffMember = await prisma.user.findFirst({
          where: {
            id: input.userId,
            managerId: user.id,
          },
        });

        if (!staffMember) {
          throw new GraphQLError("Staff member not found");
        }

        const shift = await prisma.shift.create({
          data: {
            ...input,
            status: input.status || "SCHEDULED",
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            clockIns: {
              include: {
                location: true,
              },
            },
            clockOuts: {
              include: {
                location: true,
              },
            },
          },
        });

        return shift;
      } catch (error) {
        console.error("Error creating shift:", error);
        throw new GraphQLError("Failed to create shift");
      }
    },

    // Update shift
    updateShift: async (_, { id, input }, { user }) => {
      ensureManager(user);

      try {
        const shift = await prisma.shift.findFirst({
          where: {
            id,
            user: {
              managerId: user.id,
            },
          },
        });

        if (!shift) {
          throw new GraphQLError("Shift not found");
        }

        const updatedShift = await prisma.shift.update({
          where: { id },
          data: input,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        return updatedShift;
      } catch (error) {
        console.error("Error updating shift:", error);
        throw new GraphQLError("Failed to update shift");
      }
    },

    // Delete shift
    deleteShift: async (_, { id }, { user }) => {
      ensureManager(user);

      try {
        const shift = await prisma.shift.findFirst({
          where: {
            id,
            user: {
              managerId: user.id,
            },
          },
        });

        if (!shift) {
          throw new GraphQLError("Shift not found");
        }

        await prisma.shift.delete({
          where: { id },
        });

        return true;
      } catch (error) {
        console.error("Error deleting shift:", error);
        throw new GraphQLError("Failed to delete shift");
      }
    },
  },
};
