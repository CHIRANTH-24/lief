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

      const { shiftId, location } = input;

      // Check if shift exists and belongs to user
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!shift) {
        throw new Error("Shift not found");
      }

      if (shift.userId !== context.user.id && context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      // Create location if provided
      let locationId = null;
      if (location) {
        const createdLocation = await prisma.location.create({
          data: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          },
        });
        locationId = createdLocation.id;
      }

      // Create clock-in
      return prisma.clockIn.create({
        data: {
          userId: context.user.id,
          shiftId,
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

      const { shiftId, location } = input;

      // Check if shift exists and belongs to user
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!shift) {
        throw new Error("Shift not found");
      }

      if (shift.userId !== context.user.id && context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      // Create location if provided
      let locationId = null;
      if (location) {
        const createdLocation = await prisma.location.create({
          data: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          },
        });
        locationId = createdLocation.id;
      }

      // Create clock-out
      return prisma.clockOut.create({
        data: {
          userId: context.user.id,
          shiftId,
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
