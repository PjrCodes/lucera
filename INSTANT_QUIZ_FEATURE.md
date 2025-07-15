# Instant Mini-Quiz Feature

## Overview
The Instant Mini-Quiz feature allows students to take AI-generated quizzes based on their course syllabus. This feature enhances student engagement and provides a quick way to review course material.

## Features
- **AI-Generated Questions**: Uses Google Gemini AI to generate 10 multiple-choice questions based on the course syllabus
- **Interactive UI**: Beautiful, responsive quiz interface with progress tracking
- **Real-time Feedback**: Shows correct answers and explanations after completion
- **Score Tracking**: Displays percentage score and time taken
- **Retake Option**: Students can generate new quizzes for additional practice

## Components

### 1. LLM Schema (`src/lib/schemas/llm.ts`)
- Added `quizExtractorSchema` for structured quiz data
- Defines question format with 4 options, correct answer, and explanations

### 2. LLM Function (`src/lib/llm/quiz.ts`)
- `LLMQuizExtractor`: Generates quiz using Gemini AI
- Uses custom prompts for educational quiz generation

### 3. API Route (`src/app/api/quiz/generate/route.ts`)
- POST endpoint for quiz generation
- Validates student enrollment
- Loads syllabus file and calls LLM

### 4. Quiz Dialog (`src/components/feature/quiz/instant-quiz-dialog.tsx`)
- Complete quiz taking experience
- Progress tracking and navigation
- Results display with detailed explanations
- Color-coded feedback (green/yellow/red based on score)

### 5. Course Header Integration (`src/components/feature/course/cards/course-header.tsx`)
- Added "Take Quiz" button for students only
- Brain icon for quick recognition
- Integrated with quiz dialog

## Usage
1. Students navigate to any course page
2. Click the "Take Quiz" button (brain icon) in the course header
3. System generates quiz based on course syllabus
4. Students answer 10 multiple-choice questions
5. View results with detailed explanations
6. Option to retake with new questions

## Technical Details
- **Authentication**: Only enrolled students can access
- **AI Model**: Google Gemini 2.5 Flash
- **Question Quality**: Mixed difficulty levels covering all syllabus topics
- **Performance**: Quiz data is not stored (instant feedback only)
- **Colors**: Meaningful color coding for right/wrong answers

## Files Modified/Created
- `src/lib/schemas/llm.ts` - Added quiz schema
- `src/lib/llm/quiz.ts` - Quiz generation function
- `src/app/api/quiz/generate/route.ts` - API endpoint
- `src/components/feature/quiz/instant-quiz-dialog.tsx` - Quiz UI
- `src/components/feature/course/cards/course-header.tsx` - Added quiz button
- `src/appdata/prompts/quiz_extractor/` - AI prompts for quiz generation

## Future Enhancements
- Quiz history tracking
- Performance analytics
- Custom quiz topics
- Difficulty level selection
- Time limits and challenges
