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
- **Gamification** - *Lighthouse* system of bdages, achievements, and leaderboards to enhance student engagement

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

## Installation

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

   Create a `.env.local` file with the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # MongoDB
   MONGODB_URI=your-mongodb-connection-string

   # AI Services
   GOOGLE_GENAI_API_KEY=your-genai-api-key
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   This starts both the Next.js development server and the Socket.io server concurrently.

## Development

### Available Scripts

- `npm run dev` - Start development servers (Next.js + Socket.io)
- `npm run build` - Build for production
- `npm run start` - Start production servers
- `npm run socket` - Start Socket.io server only

### Project Structure

TODO

## Design System

TODO
