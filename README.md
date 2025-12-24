# Minimal Hour Dashboard

A Next.js web application that integrates with Airtable to display client billable and non-billable hours data in a digestible dashboard format.

## Features

- **Admin Dashboard**: Protected admin interface for managing client pages
  - Login with email/password authentication
  - Select clients from Airtable
  - Generate shareable client dashboard URLs
  - View existing generated URLs

- **Public Client Dashboard**: Shareable client-facing dashboard
  - Display billable and non-billable hours totals
  - Filter by month and consultant
  - View detailed hours entries in a table
  - Responsive design for all devices

## Tech Stack

- **Next.js 14** with TypeScript
- **NextAuth.js** for authentication
- **Airtable** for data storage
- **Tailwind CSS** for styling
- **Jest** for testing

## Prerequisites

- Node.js 18+ and npm
- An Airtable account with:
  - API key (Personal Access Token)
  - Base with "Clients" and "Hours Log" tables configured

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd minimal-hour-dashboard
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Airtable Base

Ensure your Airtable base has the following structure:

#### Clients Table
- **Name** (Single line text) - Required
- **Company** (Single line text) - Optional
- **GeneratedPageURL** (Single line text) - Initially empty

#### Hours Log Table
- **ClientID** (Link to Clients table) - Required
- **Date** (Date) - Required
- **Consultant** (Single line text) - Required
- **Description** (Long text) - Required
- **Status** (Single select: "Billable" or "Non-billable") - Required
- **Hours** (Number) - Required
- **Internal** (Checkbox) - Entries with this checked are excluded from client dashboards

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Access Admin Dashboard

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and log in with your admin credentials.

## Project Structure

```
minimal-hour-dashboard/
├── pages/
│   ├── admin.tsx              # Admin dashboard
│   ├── client/[clientId].tsx  # Public client dashboard
│   └── api/                   # API routes
├── components/
│   ├── Admin/                 # Admin components
│   └── Client/                # Client dashboard components
├── lib/
│   ├── airtable.ts            # Airtable client setup
│   ├── airtable-client.ts     # Client data functions
│   ├── airtable-hours.ts      # Hours data functions
│   └── types.ts               # TypeScript interfaces
└── __tests__/                 # Unit tests
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Testing

Run the test suite:

```bash
npm test
```

Tests are located in `__tests__/` directory and cover:
- Airtable client functions
- Hours calculation logic
- Date utility functions

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for admin credentials
- Keep Airtable API keys secure
- Rotate `NEXTAUTH_SECRET` periodically

## License

MIT

