# Advanced POS System Setup Guide

## Prerequisites
- Node.js 18.x or later
- PostgreSQL database server
- Auth0 account
- npm or yarn package manager

## Initial Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure Environment Variables:
- Copy `.env.example` to `.env`
- Update the following variables:
  ```
  # Auth0 Configuration
  AUTH0_SECRET='your-generated-secret'
  AUTH0_BASE_URL='http://localhost:3000'
  AUTH0_ISSUER_BASE_URL='your-auth0-domain'
  AUTH0_CLIENT_ID='your-auth0-client-id'
  AUTH0_CLIENT_SECRET='your-auth0-client-secret'

  # Database Configuration
  DATABASE_URL='postgres://postgres:postgres@localhost:5432/pos_db'
  DATABASE_HOST='localhost'
  DATABASE_PORT='5432'
  DATABASE_NAME='pos_db'
  DATABASE_USER='postgres'
  DATABASE_PASSWORD='postgres'
  ```

3. Set up the database:
```bash
# Create database tables
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

## Common Issues and Solutions

1. Database Connection Issues:
- Ensure PostgreSQL is running
- Verify database credentials in .env file
- Check if database exists and is accessible

2. Auth0 Configuration:
- Verify Auth0 credentials in .env file
- Ensure callback URLs are properly configured in Auth0 dashboard
- Check if Auth0 application type is set to 'Regular Web Application'

3. Development Server:
- Default port is 3000, ensure it's not in use
- Check for Node.js version compatibility
- Clear .next cache if needed: `rm -rf .next`

## Additional Tools

- Database Studio: `npm run studio`
- Database Viewer: `npm run db:viewer`
- Check Database Connection: `npm run studio:check`