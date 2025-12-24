# Bollet Lottery Website

A Next.js web application for managing and viewing Bollet lottery results. Bollet is a lottery game with 3 two-digit numbers across three different games (Red, Green, and Blue).

## Features

- **User Authentication**: Secure login and registration system using NextAuth.js
- **Results Viewing**: Users can view lottery results from the last month in a clear, color-coded table
- **Admin Panel**: Administrators can add daily lottery results for all three games
- **Role-Based Access**: Different features for regular users and administrators
- **Responsive Design**: Built with Tailwind CSS for a modern, mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/laurent34001-blip/audrey-lottery.git
cd audrey-lottery
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Seed the database with sample data (optional):
```bash
npx tsx prisma/seed.ts
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- 30 days of sample lottery results

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### For Regular Users

1. **Register**: Create an account at `/register`
2. **Login**: Sign in at `/login`
3. **View Results**: Access the results page to see the last month's lottery results in a table format with:
   - Date column
   - Red Game numbers (red background)
   - Green Game numbers (green background)
   - Blue Game numbers (blue background)

### For Administrators

Administrators have all regular user features plus:

1. **Admin Panel**: Access via the "Admin Panel" button after logging in
2. **Add Results**: Enter daily lottery results for all three games
3. **Date Selection**: Choose the date for the results
4. **Number Entry**: Enter 2-digit numbers (00-99) for each game

## Project Structure

```
audrey-lottery/
├── app/
│   ├── admin/              # Admin panel page
│   ├── api/
│   │   ├── auth/          # NextAuth.js API routes
│   │   ├── register/      # User registration endpoint
│   │   └── results/       # Lottery results endpoint
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── results/           # Results viewing page
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
└── types/                # TypeScript type definitions
```

## Database Schema

### User Model
- id: Unique identifier
- email: User email (unique)
- name: User's name
- password: Hashed password
- role: "user" or "admin"

### LotteryResult Model
- id: Unique identifier
- date: Date of the lottery (unique)
- redGame: Red game number (2 digits)
- greenGame: Green game number (2 digits)
- blueGame: Blue game number (2 digits)

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Security

- Passwords are hashed using bcryptjs
- Authentication is handled by NextAuth.js with JWT strategy
- Admin routes are protected with role-based access control
- Form validation ensures data integrity

## License

ISC

## Author

Audrey's Lottery Team
