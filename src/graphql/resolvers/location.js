import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const locationResolvers = {
  Query: {
    location: async (_, { id }) => {
      return prisma.location.findUnique({
        where: { id },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    locations: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If user is a manager, return all locations
      if (context.user.role === "MANAGER") {
        return prisma.location.findMany({
          include: {
            clockIns: true,
            clockOuts: true,
          },
        });
      }

      // If user is a careworker, return only locations from their clock-ins/outs
      const userClockIns = await prisma.clockIn.findMany({
        where: { userId: context.user.id },
        select: { locationId: true },
      });

      const userClockOuts = await prisma.clockOut.findMany({
        where: { userId: context.user.id },
        select: { locationId: true },
      });

      const locationIds = [
        ...userClockIns.map((ci) => ci.locationId),
        ...userClockOuts.map((co) => co.locationId),
      ].filter(Boolean);

      return prisma.location.findMany({
        where: {
          id: {
            in: locationIds,
          },
        },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },
  },

  Mutation: {
    createLocation: async (_, { input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { latitude, longitude, address } = input;

      return prisma.location.create({
        data: {
          latitude,
          longitude,
          address,
        },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },

    updateLocation: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { latitude, longitude, address } = input;

      // Check if location exists
      const existingLocation = await prisma.location.findUnique({
        where: { id },
      });

      if (!existingLocation) {
        throw new Error("Location not found");
      }

      return prisma.location.update({
        where: { id },
        data: {
          latitude,
          longitude,
          address,
        },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },

    deleteLocation: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      // Check if location exists
      const existingLocation = await prisma.location.findUnique({
        where: { id },
      });

      if (!existingLocation) {
        throw new Error("Location not found");
      }

      // Check if location is being used
      const clockIns = await prisma.clockIn.findMany({
        where: { locationId: id },
      });

      const clockOuts = await prisma.clockOut.findMany({
        where: { locationId: id },
      });

      if (clockIns.length > 0 || clockOuts.length > 0) {
        throw new Error("Cannot delete location that is being used");
      }

      await prisma.location.delete({
        where: { id },
      });

      return true;
    },
  },
};
