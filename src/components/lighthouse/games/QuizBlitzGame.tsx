"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Star, Timer, Zap } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  course: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuizBlitzGameProps {
  onBack: () => void;
}

const QuizBlitzGame: React.FC<QuizBlitzGameProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // @TODO: Replace with actual course-based data from database
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What is a variable in programming?",
      options: ["A constant value", "A storage location with a name", "A type of loop", "A function parameter"],
      correctAnswer: 1,
      explanation: "A variable is a storage location with an associated name that can hold data.",
      course: "CS101",
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Which of the following is NOT a primitive data type in most programming languages?",
      options: ["Integer", "Boolean", "String", "Array"],
      correctAnswer: 3,
      explanation: "Array is a composite data type, not a primitive one. Primitive types include integer, boolean, and string.",
      course: "CS101",
      difficulty: "medium"
    },
    {
      id: 3,
      question: "What does 'Big O' notation describe?",
      options: ["Memory usage", "Algorithm efficiency", "Variable scope", "Code readability"],
      correctAnswer: 1,
      explanation: "Big O notation describes the worst-case time complexity of an algorithm.",
      course: "CS201",
      difficulty: "medium"
    },
    {
      id: 4,
      question: "In object-oriented programming, what is inheritance?",
      options: ["Creating multiple objects", "A class acquiring properties from another class", "Hiding implementation details", "Overloading methods"],
      correctAnswer: 1,
      explanation: "Inheritance allows a class to acquire properties and methods from another class.",
      course: "CS201",
      difficulty: "medium"
    },
    {
      id: 5,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      explanation: "Binary search has O(log n) time complexity as it eliminates half the search space in each iteration.",
      course: "CS301",
      difficulty: "hard"
    },
    {
      id: 6,
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
      correctAnswer: 2,
      explanation: "Quick Sort has an average-case time complexity of O(n log n), which is better than the O(n²) of the other options.",
      course: "CS301",
      difficulty: "hard"
    },
    {
      id: 7,
      question: "What is a stack data structure?",
      options: ["First In First Out (FIFO)", "Last In First Out (LIFO)", "Random access", "Sorted collection"],
      correctAnswer: 1,
      explanation: "A stack follows the Last In First Out (LIFO) principle.",
      course: "CS201",
      difficulty: "easy"
    },
    {
      id: 8,
      question: "What is the purpose of a constructor in OOP?",
      options: ["To destroy objects", "To initialize objects", "To copy objects", "To compare objects"],
      correctAnswer: 1,
      explanation: "A constructor is used to initialize objects when they are created.",
      course: "CS201",
      difficulty: "easy"
    }
  ];

  const initializeGame = () => {
    const shuffledQuestions = [...quizQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions.slice(0, 6)); // Use 6 random questions
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(15);
    setGameStarted(false);
    setGameCompleted(false);
    setStreak(0);
    setMaxStreak(0);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(15);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || !gameStarted) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !gameStarted) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setShowResult(true);
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2); // 2 points per second remaining
      const difficultyBonus = currentQuestion.difficulty === "easy" ? 10 : 
                             currentQuestion.difficulty === "medium" ? 20 : 30;
      const streakBonus = streak * 5;
      
      const totalPoints = difficultyBonus + timeBonus + streakBonus;
      setScore(score + totalPoints);
      setCorrectAnswers(correctAnswers + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showResult && !gameCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      // Time's up, auto-submit
      setShowResult(true);
      setStreak(0);
    }
  }, [timeLeft, gameStarted, showResult, gameCompleted]);

  useEffect(() => {
    initializeGame();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  if (!gameStarted && !gameCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 Quiz Blitz</h1>
          <p className="text-gray-600 mb-6">Fast-paced quiz with 15 seconds per question!</p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Game Rules</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li>✓ Answer each question within 15 seconds</li>
              <li>✓ Earn bonus points for quick answers</li>
              <li>✓ Build streaks for extra points</li>
              <li>✓ Harder questions give more points</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="bg-lucerapurple-3 text-white px-8 py-4 rounded-lg hover:bg-lucerapurple-4 text-xl font-bold flex items-center gap-2 mx-auto"
          >
            <Zap className="w-6 h-6" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-lucerayellow-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-lucerayellow-5">{score}</div>
              <div className="text-lucerayellow-4">Final Score</div>
            </div>
            <div className="bg-luceragreen-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-luceragreen-5">{accuracy}%</div>
              <div className="text-luceragreen-4">Accuracy</div>
            </div>
            <div className="bg-lucerablue-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-lucerablue-5">{correctAnswers}/{questions.length}</div>
              <div className="text-lucerablue-4">Correct</div>
            </div>
            <div className="bg-lucerapurple-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-lucerapurple-5">{maxStreak}</div>
              <div className="text-lucerapurple-4">Best Streak</div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="bg-lucerapurple-3 text-white px-6 py-3 rounded-lg hover:bg-lucerapurple-4 font-bold"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-lucerayellow-1 px-3 py-1 rounded-lg">
            <Star className="w-4 h-4 text-lucerayellow-4" />
            <span className="font-bold text-lucerayellow-5">{score}</span>
          </div>
          <div className="text-sm text-gray-600">
            Streak: <span className="font-bold text-lucerapurple-5">{streak}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{currentQuestion?.course}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-lucerapurple-3 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${
          timeLeft <= 5 ? 'bg-lucerared-1 text-lucerared-5 animate-pulse' : 'bg-lucerablue-1 text-lucerablue-5'
        }`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-luceragreen-1 border-luceragreen-3 text-luceragreen-5'
                        : 'bg-lucerared-1 border-lucerared-3 text-lucerared-5'
                      : 'bg-lucerablue-1 border-lucerablue-3 text-lucerablue-5'
                    : showResult && index === currentQuestion.correctAnswer
                    ? 'bg-luceragreen-1 border-luceragreen-3 text-luceragreen-5'
                    : 'bg-gray-50 border-gray-300 hover:border-lucerablue-3 hover:bg-lucerablue-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 ml-auto" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-center">
            {!showResult ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="bg-lucerapurple-3 text-white px-6 py-2 rounded-lg hover:bg-lucerapurple-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="bg-luceragreen-3 text-white px-6 py-2 rounded-lg hover:bg-luceragreen-4"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBlitzGame;
