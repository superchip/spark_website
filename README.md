# Spark - Micro-Learning Platform

A modern web application that helps users achieve their learning goals through bite-sized learning tasks called "Sparks" - small, focused activities that take 2-10 minutes to complete.

## Features

- **Goal-Based Learning**: Create and track learning goals
- **Micro-Learning Tasks**: Break down goals into small, manageable "Sparks"
- **AI-Powered**: Integrated with Groq API for intelligent learning assistance
- **User Authentication**: Secure authentication via Supabase
- **Progress Tracking**: Monitor your learning journey with completion tracking
- **Premium Tiers**: Support for free, pro, and enterprise tiers

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase
- **AI Integration**: Groq API
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
spark_website/
└── spark-app/          # Main Next.js application
    ├── src/
    │   ├── app/        # Next.js app router pages
    │   ├── components/ # React components
    │   ├── hooks/      # Custom React hooks
    │   ├── lib/        # Utilities and configurations
    │   ├── store/      # Zustand state management
    │   └── types/      # TypeScript type definitions
    ├── public/         # Static assets
    └── supabase-schema.sql  # Database schema
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- A Supabase account
- A Groq API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spark_website/spark-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GROQ_API_KEY=gsk_your-key-here
```

5. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles with premium tier information
- **goals**: Learning goals created by users
- **sparks**: Individual micro-learning tasks associated with goals
- **spark_completions**: Tracks completed sparks and user progress

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]
