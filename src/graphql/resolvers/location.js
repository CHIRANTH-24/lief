import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

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
            latitude: true,
            longitude: true,
            address: true,
            radius: true,
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
    checkLocationPerimeter: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const { latitude, longitude } = input;

      // Get all locations
      const locations = await prisma.location.findMany();
      
      // Find nearest location and check if within radius
      let nearestLocation = null;
      let shortestDistance = Infinity;
      let isWithinPerimeter = false;

      for (const location of locations) {
        const distance = calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestLocation = location;
        }

        // Check if within radius of any location
        if (distance <= location.radius) {
          isWithinPerimeter = true;
        }
      }

      return {
        isWithinPerimeter,
        nearestLocation
      };
    }
  },

  Mutation: {
    createLocation: async (_, { input }, context) => {
      if (!context.user || context.user.role !== "MANAGER") {
        throw new Error("Not authorized");
      }

      const { latitude, longitude, address, radius } = input;

      return prisma.location.create({
        data: {
          latitude,
          longitude,
          address,
          radius,
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

      const { latitude, longitude, address, radius } = input;

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
          radius,
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
