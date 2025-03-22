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
import { managerResolvers } from "./resolvers/manager.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
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
    ...managerResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...shiftResolvers.Mutation,
    ...clockResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...managerResolvers.Mutation,
  },
};

//  Authentication Middleware
const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null }; // Return user as null instead of {}
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB (Only fetch necessary fields)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, firstName: true, email: true, role: true }, // Optimize fields
    });

    return { user };
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return { user: null };
  }
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => await getUserFromToken(req),
});

console.log(`🚀 Server ready at ${url}`);
