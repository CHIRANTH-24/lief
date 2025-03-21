import { gql } from '@apollo/client';

// Query: Get currently clocked in staff
export const GET_CLOCKED_IN_STAFF = gql`
  query GetClockedInStaff {
    getClockedInStaff {
      id
      firstName
      lastName
      email
      clockIns(last: 1) {
        timestamp
        location {
          latitude
          longitude
          address
        }
      }
    }
  }
`;

// Query: Get staff clock records
export const GET_STAFF_CLOCK_RECORDS = gql`
  query GetStaffClockRecords {
    getStaffClockRecords {
      user {
        id
        firstName
        lastName
      }
      clockIns {
        id
        timestamp
        location {
          latitude
          longitude
          address
        }
      }
      clockOuts {
        id
        timestamp
        location {
          latitude
          longitude
          address
        }
      }
    }
  }
`;

// Query: Get daily statistics
export const GET_DAILY_STATS = gql`
  query GetDailyStats($startDate: DateTime!, $endDate: DateTime) {
    getDailyStats(startDate: $startDate, endDate: $endDate) {
      date
      averageHours
      clockInCount
    }
  }
`;

// Query: Get weekly staff hours
export const GET_WEEKLY_STAFF_HOURS = gql`
  query GetWeeklyStaffHours {
    getWeeklyStaffHours {
      user {
        id
        firstName
        lastName
      }
      totalHours
    }
  }
`;

// Mutation: Set location perimeter
export const SET_LOCATION_PERIMETER = gql`
  mutation SetLocationPerimeter($input: LocationPerimeterInput!) {
    setLocationPerimeter(input: $input) {
      id
      latitude
      longitude
      address
    }
  }
`;