"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExtractedQuiz } from "@/lib/schemas/llm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { CheckCircle, XCircle, Clock, ArrowLeft, RotateCcw } from "lucide-react";

interface QuizPageProps {
  courseName: string;
  courseId: string;
}

type QuizState = "loading" | "ready" | "in-progress" | "question-feedback" | "completed";

export default function QuizPage({ courseName, courseId }: QuizPageProps) {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [quiz, setQuiz] = useState<ExtractedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);

  // Load quiz data
  const loadQuiz = useCallback(async () => {
    setQuizState("loading");
    setError(null);
    
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      setQuiz(data.quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setQuizState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setQuizState("completed");
    }
  }, [courseId]);

  // Initial load
  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!quiz) return;
    
    const newAnswers = [...userAnswers, selectedAnswer ?? -1];
    setUserAnswers(newAnswers);
    setQuizState("question-feedback");
  }, [quiz, userAnswers, selectedAnswer]);

  // Timer effect
  useEffect(() => {
    if (quizState !== "in-progress") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, handleTimeUp]);

  // Start quiz
  const startQuiz = () => {
    setQuizState("in-progress");
    setTimeLeft(30);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState !== "in-progress") return;
    setSelectedAnswer(answerIndex);
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !quiz) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    setQuizState("question-feedback");
  };

  // Continue to next question
  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setQuizState("in-progress");
    } else {
      setQuizState("completed");
    }
  };

  // Calculate final score
  const calculateScore = () => {
    if (!quiz) return 0;
    const correct = userAnswers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return Math.round((correct / quiz.questions.length) * 100);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </SecondaryButton>
                <PrimaryButton onClick={loadQuiz}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizState === "loading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Generating your quiz...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizState === "ready" && quiz) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <p className="text-muted-foreground">{quiz.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Quiz Information</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {quiz.questions.length} questions</li>
                  <li>• 30 seconds per question</li>
                  <li>• Instant feedback after each question</li>
                  <li>• Course: {courseName}</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </SecondaryButton>
                <PrimaryButton onClick={startQuiz} className="flex-1">
                  Start Quiz
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if ((quizState === "in-progress" || quizState === "question-feedback") && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const showFeedback = quizState === "question-feedback";

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Header */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={`font-mono ${timeLeft <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              <div className="flex gap-2 text-xs">
                <span className="bg-muted px-2 py-1 rounded">{currentQuestion.topic}</span>
                <span className={`px-2 py-1 rounded capitalize ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonClass = "text-left p-4 border-2 rounded-lg transition-all";
                  
                  if (showFeedback) {
                    if (index === currentQuestion.correctAnswer) {
                      buttonClass += " border-green-500 bg-green-50 text-green-700";
                    } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                      buttonClass += " border-red-500 bg-red-50 text-red-700";
                    } else {
                      buttonClass += " border-muted bg-muted/50 text-muted-foreground";
                    }
                  } else {
                    if (selectedAnswer === index) {
                      buttonClass += " border-primary bg-primary/10 text-primary";
                    } else {
                      buttonClass += " border-muted hover:border-primary/50 hover:bg-primary/5";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={buttonClass}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                        {showFeedback && index === currentQuestion.correctAnswer && (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                        )}
                        {showFeedback && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                          <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <Card className="border-muted bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between pt-4">
                {!showFeedback ? (
                  <>
                    <SecondaryButton 
                      onClick={() => router.back()}
                      variant="outline"
                    >
                      Exit Quiz
                    </SecondaryButton>
                    <PrimaryButton 
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                    >
                      Submit Answer
                    </PrimaryButton>
                  </>
                ) : (
                  <>
                    <div></div>
                    <PrimaryButton onClick={handleNextQuestion}>
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                    </PrimaryButton>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizState === "completed" && quiz) {
    const score = calculateScore();
    const correctAnswers = userAnswers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
              <p className="text-muted-foreground">Here&apos;s how you performed</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-muted-foreground">
                  {correctAnswers} out of {quiz.questions.length} questions correct
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Performance Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Correct Answers:</span>
                    <span className="text-green-600 font-semibold">{correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incorrect Answers:</span>
                    <span className="text-red-600 font-semibold">{quiz.questions.length - correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-semibold">{score}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <SecondaryButton onClick={() => router.back()} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </SecondaryButton>
                <PrimaryButton onClick={loadQuiz} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
