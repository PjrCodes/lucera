# Lucera - AI-First Learning Management System

An intelligent, no-compromise Learning Management System built for the future of education. Lucera combines modern web technologies with AI capabilities to create an intuitive learning experience for both students and teachers.

## Features

### Core Features

- **Comprehensive Dashboard** - Customizable widgets including progress tracking, bookmarks, upcoming deadlines, and announcements
- **Course Management** - Full course creation, management, and student enrollment system
- **Assignment System** - Complete assignment lifecycle from creation to grading
- **Authentication** - Secure Google OAuth integration with role-based access
- **Real-time Communication** - WebSocket-powered notifications and live messaging systems
- **Progress Tracking** - Advanced analytics and progress monitoring
- **Bookmarks** - Save and organize important content
- **Gamification** - _Lighthouse_ system of bdages, achievements, and leaderboards to enhance student engagement

### AI-Powered Features

- **LISA** - Lucera's Intelligent Student Assistant for personalized learning, for both students and teachers, the LISA Chat bot provides a conversational interface to interact with the system
- **Deep Syllabus Extraction** - Auto generation of course descriptions, timelines, and units from syllabus documents!
- **Rubric Generation** - AI-assisted rubric creation for assignments
- **Content Summarization** - AI-generated summaries for course materials
- **Instant Feedback** - AI-driven feedback on assignments and quizzes
- **Automated Insights** - Progress analysis and learning recommendations

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with official adapter
- **Real-time**: Socket.io listening to MongoDB Change Streams for live features
- **UI Components**: Radix UI primitives (Soon to be replaced with React Aria)
- **AI Integration**: Google Gemini API

## Installation and Deployment

This section provides instructions for setting up the project for development and deploying it to a production environment.

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smartlms
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root of the project and add the following environment variables. These are essential for the application to run correctly.

   ```env
   # NextAuth Configuration
   # A secret key for signing tokens.
   NEXTAUTH_SECRET=your-nextauth-secret
   # The base URL of the application.
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth Credentials
   # These are required for Google authentication.
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # MongoDB Configuration
   # The connection string for your MongoDB database.
   MONGODB_URI=your-mongodb-connection-string
   # The name of the database to use.
   DB_NAME=your-db-name

   # AI and Vector Database Services
   # API key for Google Gemini.
   GEMINI_API_KEY=your-gemini-api-key
   # API key for Pinecone.
   PINECONE_API_KEY=your-pinecone-api-key

   # Frontend Configuration
   # The origin of the frontend application for CORS in the socket server.
   FRONTEND_ORIGIN=http://localhost:3000
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   This command starts both the Next.js development server and the Socket.io server concurrently, enabling all features of the application.

### Production Deployment

For production, it is recommended to deploy the Next.js application and the Socket.io server separately.

- **Next.js Application**: Can be deployed to platforms like Vercel, which is optimized for Next.js.
- **Socket.io Server**: Should be deployed as a long-running Node.js service on a platform like Heroku, AWS, or a traditional VPS.

**Important**: Ensure that all environment variables listed above are set in your production environment. The `NEXTAUTH_URL` and `FRONTEND_ORIGIN` variables should be updated to match your production domain.

## Development

### Available Scripts

- `npm run dev` - Starts both the Next.js and Socket.io development servers.
- `npm run build` - Builds the Next.js application for production.
- `npm run start` - Starts the production Next.js server.
- `npm run socket` - Starts only the Socket.io server, useful for isolated development or production.
- `npm run gensample` - Generates sample data for development purposes. This script populates the database with sample courses, assignments, and other entities to facilitate testing and development.

### Schema information

#### Timeline Items

"assignment", - createable
"quiz", - grades addable
"midsem_exam", - grades addable
"endsem_exam", - grades addable
"exam", - grades addable
"lab_exam", - grades addable
"other", - nothing
"project", - grades addable
"tutorial or workshop", - nothing
"guest lecture", - nothing
