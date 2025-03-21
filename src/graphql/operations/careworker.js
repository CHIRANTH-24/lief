import { gql } from '@apollo/client';

export const CHECK_LOCATION_PERIMETER = gql`
  query CheckLocationPerimeter($input: LocationInput!) {
    checkLocationPerimeter(input: $input) {
      isWithinPerimeter
      nearestLocation {
        id
        address
        latitude
        longitude
      }
    }
  }
`;

export const CLOCK_IN = gql`
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      id
      timestamp
      location {
        id
        address
        latitude
        longitude
      }
      shift {
        id
        startTime
        endTime
      }
    }
  }
`;

export const CLOCK_OUT = gql`
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      id
      timestamp
      location {
        id
        address
        latitude
        longitude
      }
      shift {
        id
        startTime
        endTime
      }
    }
  }
`;

export const GET_CURRENT_SHIFT = gql`
  query GetCurrentShift {
    currentShift {
      id
      startTime
      endTime
      clockIns {
        id
        timestamp
        location {
          id
          address
          latitude
          longitude
        }
      }
    }
  }
`;
