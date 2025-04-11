# Advanced POS System

An advanced Point of Sale system with Power BI integration.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Auth0 account
- PostgreSQL database
- Power BI account (for analytics)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/advanced-pos.git
cd advanced-pos
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_CALLBACK_URL=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_AUTH0_LOGOUT_URL=http://localhost:3000
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain
AUTH0_CLIENT_SECRET=your-auth0-client-secret
DATABASE_URL=your-database-url
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/yourusername/advanced-pos.git
git push -u origin main
```

3. Add the following secrets to your GitHub repository:
   - NEXT_PUBLIC_AUTH0_DOMAIN
   - NEXT_PUBLIC_AUTH0_CLIENT_ID
   - NEXT_PUBLIC_AUTH0_CALLBACK_URL
   - NEXT_PUBLIC_AUTH0_LOGOUT_URL
   - AUTH0_SECRET
   - AUTH0_BASE_URL
   - AUTH0_ISSUER_BASE_URL
   - AUTH0_CLIENT_SECRET
   - DATABASE_URL

### Vercel Deployment

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository
4. Add the same environment variables as in your `.env.local` file
5. Click "Deploy"

## Features

- User authentication and authorization
- Product and inventory management
- Customer management
- Sales tracking and reporting
- Power BI integration for analytics
- Multi-store support
- Real-time inventory updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
