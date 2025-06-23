"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Star } from "lucide-react";

interface WordPuzzle {
  id: number;
  word: string;
  hint: string;
  course: string;
  difficulty: "easy" | "medium" | "hard";
}

interface WordWhizGameProps {
  onBack: () => void;
}

const WordWhizGame: React.FC<WordWhizGameProps> = ({ onBack }) => {
  const [gameMode, setGameMode] = useState<"anagram" | "guess" | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [maskedWord, setMaskedWord] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  // @TODO: Replace with actual course-based data from database
  const wordPuzzles: WordPuzzle[] = [
    { id: 1, word: "ALGORITHM", hint: "Step-by-step procedure for solving problems", course: "CS101", difficulty: "medium" },
    { id: 2, word: "VARIABLE", hint: "Storage location with an associated name", course: "CS101", difficulty: "easy" },
    { id: 3, word: "RECURSION", hint: "Function that calls itself", course: "CS201", difficulty: "hard" },
    { id: 4, word: "ARRAY", hint: "Collection of elements in contiguous memory", course: "CS101", difficulty: "easy" },
    { id: 5, word: "INHERITANCE", hint: "OOP concept where class derives from another", course: "CS201", difficulty: "medium" },
    { id: 6, word: "POLYMORPHISM", hint: "Ability to take many forms", course: "CS201", difficulty: "hard" },
    { id: 7, word: "FUNCTION", hint: "Reusable block of code", course: "CS101", difficulty: "easy" },
    { id: 8, word: "DATABASE", hint: "Organized collection of data", course: "CS301", difficulty: "medium" },
  ];

  const shuffleWord = (word: string): string => {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
  };

  const createMaskedWord = (word: string): string => {
    const length = word.length;
    const revealCount = Math.floor(length * 0.3); // Reveal 30% of letters
    const positions = new Set<number>();
    
    while (positions.size < revealCount) {
      positions.add(Math.floor(Math.random() * length));
    }

    return word
      .split("")
      .map((letter, index) => (positions.has(index) ? letter : "_"))
      .join(" ");
  };

  const loadPuzzle = () => {
    const puzzle = wordPuzzles[puzzleIndex % wordPuzzles.length];
    setCurrentPuzzle(puzzle);
    setUserAnswer("");
    setIsCorrect(null);

    if (gameMode === "anagram") {
      let scrambled = shuffleWord(puzzle.word);
      // Ensure scrambled word is different from original
      while (scrambled === puzzle.word && puzzle.word.length > 2) {
        scrambled = shuffleWord(puzzle.word);
      }
      setScrambledWord(scrambled);
    } else if (gameMode === "guess") {
      setMaskedWord(createMaskedWord(puzzle.word));
    }
  };

  const checkAnswer = () => {
    if (!currentPuzzle) return;

    const correct = userAnswer.toUpperCase() === currentPuzzle.word.toUpperCase();
    setIsCorrect(correct);

    if (correct) {
      const points = currentPuzzle.difficulty === "easy" ? 10 : currentPuzzle.difficulty === "medium" ? 20 : 30;
      setScore(score + points + streak * 5); // Bonus for streak
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const nextPuzzle = () => {
    setPuzzleIndex(puzzleIndex + 1);
    loadPuzzle();
  };

  const resetGame = () => {
    setScore(0);
    setStreak(0);
    setPuzzleIndex(0);
    loadPuzzle();
  };

  useEffect(() => {
    if (gameMode) {
      loadPuzzle();
    }
  }, [gameMode]);

  if (!gameMode) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔠 Word Whiz</h1>
          <p className="text-gray-600">Choose your game mode!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setGameMode("anagram")}            className="bg-primary-100 border-2 border-primary-300 p-6 rounded-lg hover:bg-primary-200 transition-colors"
          >
            <h3 className="text-xl font-bold text-primary-800 mb-2">Anagram Solve</h3>
            <p className="text-primary-600">Unscramble the letters to form the correct word</p>
          </button>
          <button
            onClick={() => setGameMode("guess")}
            className="bg-secondary-100 border-2 border-secondary-300 p-6 rounded-lg hover:bg-secondary-200 transition-colors"
          >
            <h3 className="text-xl font-bold text-secondary-800 mb-2">Guess the Word</h3>
            <p className="text-secondary-600">Fill in the blanks with hints provided</p>
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
          onClick={() => setGameMode(null)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Mode
        </button>
        <div className="flex items-center gap-4">          <div className="flex items-center gap-2 bg-primary-100 px-3 py-1 rounded-lg">
            <Star className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-primary-800">{score}</span>
          </div>
          <div className="text-sm text-gray-600">
            Streak: <span className="font-bold">{streak}</span>
          </div>
        </div>
      </div>

      {currentPuzzle && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {gameMode === "anagram" ? "🔤 Anagram Solve" : "🔍 Guess the Word"}
            </h2>            <div className="inline-block bg-secondary-100 px-3 py-1 rounded-full">
              <span className="text-secondary-800 text-sm font-medium">{currentPuzzle.course}</span>
            </div>
          </div>

          <div className="text-center mb-6">
            {gameMode === "anagram" ? (
              <div className="text-4xl font-mono font-bold text-gray-800 tracking-wider mb-4">
                {scrambledWord.split("").join(" ")}
              </div>
            ) : (
              <div className="text-4xl font-mono font-bold text-gray-800 tracking-wider mb-4">
                {maskedWord}
              </div>
            )}
            <p className="text-gray-600 italic">"{currentPuzzle.hint}"</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
              placeholder="Enter your answer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-300 focus:border-transparent text-center text-xl font-mono"
              disabled={isCorrect !== null}
            />

            <div className="flex gap-3 justify-center">
              {isCorrect === null ? (
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="bg-secondary-500 text-white px-6 py-2 rounded-lg hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={nextPuzzle}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
                >
                  Next Puzzle
                </button>
              )}
              <button
                onClick={resetGame}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {isCorrect !== null && (
              <div className={`text-center p-4 rounded-lg ${
                isCorrect 
                  ? "bg-green-100 text-green-800" 
                  : "bg-lucerared-1 text-lucerared-5"
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <span className="font-bold">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </span>
                </div>
                {!isCorrect && (
                  <p>The correct answer was: <span className="font-bold">{currentPuzzle.word}</span></p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWhizGame;
