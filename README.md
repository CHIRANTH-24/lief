# Lief - Healthcare Clock System

A modern healthcare workforce management system built with Next.js, GraphQL, and Prisma.

## Features

- User authentication and authorization
- Role-based access control (Manager and Careworker roles)
- Shift management
- Clock in/out functionality with location tracking
- Real-time updates
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18 or later
- PostgreSQL database
- npm or yarn package manager

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd lief
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

- Copy `.env.example` to `.env`
- Update the following variables:
  - `DATABASE_URL`: Your PostgreSQL database connection string
  - `JWT_SECRET`: A secure secret key for JWT token generation

4. Set up the database:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

5. Start the development servers:

In one terminal:

```bash
# Start the Next.js frontend
npm run dev
```

In another terminal:

```bash
# Start the GraphQL backend
npm run graphql:dev
```

The application will be available at:

- Frontend: http://localhost:3000
- GraphQL Playground: http://localhost:4000

## Available Scripts

- `npm run dev`: Start the Next.js development server
- `npm run build`: Build the Next.js application
- `npm run start`: Start the production Next.js server
- `npm run lint`: Run ESLint
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio for database management
- `npm run graphql:dev`: Start the GraphQL development server

## Project Structure

```
lief/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── graphql/            # GraphQL schema and resolvers
│   │   ├── resolvers/      # GraphQL resolvers
│   │   ├── schema.graphql  # GraphQL schema
│   │   └── server.js       # GraphQL server setup
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── prisma/
│   └── schema.prisma       # Prisma schema
├── public/                 # Static files
└── package.json           # Project dependencies
```

## Database Schema

The application uses the following main models:

- `User`: Represents users (managers and careworkers)
- `Shift`: Represents work shifts
- `ClockIn`: Records when users clock in
- `ClockOut`: Records when users clock out
- `Location`: Stores location data for clock in/out events

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. The token is included in the Authorization header for all GraphQL requests:

```
Authorization: Bearer <token>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
