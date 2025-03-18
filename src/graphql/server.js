import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import { join } from "path";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { userResolvers } from "./resolvers/user.js";
import { shiftResolvers } from "./resolvers/shift.js";
import { clockResolvers } from "./resolvers/clock.js";
import { locationResolvers } from "./resolvers/location.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Read the GraphQL schema
const typeDefs = readFileSync(
  join(process.cwd(), "src/graphql/schema.graphql"),
  "utf-8"
);

// Combine all resolvers
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...shiftResolvers.Query,
    ...clockResolvers.Query,
    ...locationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...shiftResolvers.Mutation,
    ...clockResolvers.Mutation,
    ...locationResolvers.Mutation,
  },
  User: {
    shifts: async (parent) => {
      return prisma.shift.findMany({
        where: { userId: parent.id },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    clockIns: async (parent) => {
      return prisma.clockIn.findMany({
        where: { userId: parent.id },
        include: {
          shift: true,
          location: true,
        },
      });
    },
    clockOuts: async (parent) => {
      return prisma.clockOut.findMany({
        where: { userId: parent.id },
        include: {
          shift: true,
          location: true,
        },
      });
    },
    managedStaff: async (parent) => {
      return prisma.user.findMany({
        where: { managerId: parent.id },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    manager: async (parent) => {
      if (!parent.managerId) return null;
      return prisma.user.findUnique({
        where: { id: parent.managerId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
  },
  Shift: {
    user: async (parent) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    clockIns: async (parent) => {
      return prisma.clockIn.findMany({
        where: { shiftId: parent.id },
        include: {
          user: true,
          location: true,
        },
      });
    },
    clockOuts: async (parent) => {
      return prisma.clockOut.findMany({
        where: { shiftId: parent.id },
        include: {
          user: true,
          location: true,
        },
      });
    },
  },
  ClockIn: {
    user: async (parent) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    shift: async (parent) => {
      return prisma.shift.findUnique({
        where: { id: parent.shiftId },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    location: async (parent) => {
      if (!parent.locationId) return null;
      return prisma.location.findUnique({
        where: { id: parent.locationId },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },
  },
  ClockOut: {
    user: async (parent) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    shift: async (parent) => {
      return prisma.shift.findUnique({
        where: { id: parent.shiftId },
        include: {
          user: true,
          clockIns: true,
          clockOuts: true,
        },
      });
    },
    location: async (parent) => {
      if (!parent.locationId) return null;
      return prisma.location.findUnique({
        where: { id: parent.locationId },
        include: {
          clockIns: true,
          clockOuts: true,
        },
      });
    },
  },
  Location: {
    clockIns: async (parent) => {
      return prisma.clockIn.findMany({
        where: { locationId: parent.id },
        include: {
          user: true,
          shift: true,
        },
      });
    },
    clockOuts: async (parent) => {
      return prisma.clockOut.findMany({
        where: { locationId: parent.id },
        include: {
          user: true,
          shift: true,
        },
      });
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return {};
    }

    try {
      // Extract the token
      const token = authHeader.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });

      return { user };
    } catch (error) {
      console.error("Error verifying token:", error);
      return {};
    }
  },
});

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return {};
    }

    try {
      // Extract the token
      const token = authHeader.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          shifts: true,
          clockIns: true,
          clockOuts: true,
          managedStaff: true,
          manager: true,
        },
      });

      return { user };
    } catch (error) {
      console.error("Error verifying token:", error);
      return {};
    }
  },
});

console.log(`🚀 Server ready at ${url}`);
