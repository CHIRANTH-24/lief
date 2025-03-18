import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return context.user;
    },
    user: async (_, { id }) => {
      return prisma.user.findUnique({
        where: { id },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });
    },
    users: async () => {
      return prisma.user.findMany({
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { email, password, firstName, lastName, role } = input;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return {
        token,
        user,
      };
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return {
        token,
        user,
      };
    },

    createUser: async (_, { input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { email, password, firstName, lastName, role, managerId } = input;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      return prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
          managerId: managerId || context.user.id,
        },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });
    },

    updateUser: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { email, firstName, lastName, role, managerId } = input;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Update user
      return prisma.user.update({
        where: { id },
        data: {
          email,
          firstName,
          lastName,
          role,
          managerId,
        },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });
    },

    deleteUser: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Delete user
      await prisma.user.delete({
        where: { id },
      });

      return true;
    },
  },
};
