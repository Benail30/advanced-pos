# Advanced POS System

A modern, feature-rich Point of Sale system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🛍️ Clean, cashier-focused POS interface
- 📊 Real-time sales analytics with Power BI integration
- 👥 Customer management
- 📦 Inventory management
- 👤 Role-based access control
- 💳 Multiple payment methods
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth0
- **Analytics**: Power BI
- **State Management**: React Context + Hooks

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── db/              # Database schema and migrations
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── types/           # TypeScript type definitions
└── middleware.ts    # Next.js middleware
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/advanced-pos.git
   cd advanced-pos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables

4. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Required environment variables:

```env
# Auth0 Configuration
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Database Configuration
DATABASE_URL=

# Power BI Configuration
NEXT_PUBLIC_POWERBI_REPORT_ID=
NEXT_PUBLIC_POWERBI_WORKSPACE_ID=
NEXT_PUBLIC_POWERBI_REPORT_EMBED_URL=
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
