import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const shiftResolvers = {
  Query: {
    shift: async (_, { id }) => {
      return prisma.shift.findUnique({
        where: { id },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    shifts: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If user is a manager, return all shifts
      if (context.user.role === "MANAGER") {
        return prisma.shift.findMany({
          include: {
            user: true,
            clockIns: true,
            clockOuts: true,
          },
        });
      }

      // If user is a careworker, return only their shifts
      return prisma.shift.findMany({
        where: {
          userId: context.user.id,
        },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    currentShift: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Find the current active shift for the user
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
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });

      return currentShift;
    },
  },

  Mutation: {
    createShift: async (_, { input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { startTime, endTime, userId, status } = input;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Create shift
      return prisma.shift.create({
        data: {
          startTime,
          endTime,
          userId,
          status: status || "SCHEDULED",
        },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },

    updateShift: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { startTime, endTime, status } = input;

      // Check if shift exists
      const existingShift = await prisma.shift.findUnique({
        where: { id },
      });

      if (!existingShift) {
        throw new Error("Shift not found");
      }

      // Update shift
      return prisma.shift.update({
        where: { id },
        data: {
          startTime,
          endTime,
          status,
        },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },

    deleteShift: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      // Check if shift exists
      const existingShift = await prisma.shift.findUnique({
        where: { id },
      });

      if (!existingShift) {
        throw new Error("Shift not found");
      }

      // Delete shift
      await prisma.shift.delete({
        where: { id },
      });

      return true;
    },
  },
};
