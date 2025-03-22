import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const clockResolvers = {
  Query: {
    clockIn: async (_, { id }) => {
      return prisma.clockIn.findUnique({
        where: { id },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },
    clockIns: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If user is a manager, return all clock-ins
      if (context.user.role === "MANAGER") {
        return prisma.clockIn.findMany({
          include: {
            user: true,
            shift: true,
            location: true,
          },
        });
      }

      // If user is a careworker, return only their clock-ins
      return prisma.clockIn.findMany({
        where: {
          userId: context.user.id,
        },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },
    clockOut: async (_, { id }) => {
      return prisma.clockOut.findUnique({
        where: { id },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },
    clockOuts: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If user is a manager, return all clock-outs
      if (context.user.role === "MANAGER") {
        return prisma.clockOut.findMany({
          include: {
            user: true,
            shift: true,
            location: true,
          },
        });
      }

      // If user is a careworker, return only their clock-outs
      return prisma.clockOut.findMany({
        where: {
          userId: context.user.id,
        },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },
  },

  Mutation: {
    clockIn: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Get current shift
      const now = new Date();
      const currentShift = await prisma.shift.findFirst({
        where: {
          userId: context.user.id,
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
      });

      if (!currentShift) {
        throw new Error("No active shift found");
      }

      // Check if shift is already in progress
      if (currentShift.status === "IN_PROGRESS") {
        throw new Error("Shift is already in progress");
      }

      // Create location if provided
      let locationId = null;
      if (input.location) {
        const createdLocation = await prisma.location.create({
          data: {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
            address: input.location.address,
            radius: input.location.radius || 100, // Default radius of 100 meters
          },
        });
        locationId = createdLocation.id;
      }

      // Update shift status to IN_PROGRESS
      await prisma.shift.update({
        where: { id: currentShift.id },
        data: { status: "IN_PROGRESS" },
      });

      // Create clock-in
      return prisma.clockIn.create({
        data: {
          userId: context.user.id,
          shiftId: currentShift.id,
          locationId,
        },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },

    clockOut: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Get current shift
      const now = new Date();
      const currentShift = await prisma.shift.findFirst({
        where: {
          userId: context.user.id,
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
          status: "IN_PROGRESS",
        },
      });

      if (!currentShift) {
        throw new Error("No active shift found");
      }

      // Create location if provided
      let locationId = null;
      if (input.location) {
        const createdLocation = await prisma.location.create({
          data: {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
            address: input.location.address,
            radius: input.location.radius || 100, // Default radius of 100 meters
          },
        });
        locationId = createdLocation.id;
      }

      // Update shift status to COMPLETED
      await prisma.shift.update({
        where: { id: currentShift.id },
        data: { status: "COMPLETED" },
      });

      // Create clock-out
      return prisma.clockOut.create({
        data: {
          userId: context.user.id,
          shiftId: currentShift.id,
          locationId,
        },
        include: {
          user: true,
          shift: true,
          location: true,
        },
      });
    },
  },
};
