"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, CheckCircle, Star, Timer } from "lucide-react";

interface ConceptPair {
  id: number;
  term: string;
  definition: string;
  course: string;
}
interface ConceptMatchGameProps {
  onBack: () => void;
}

const ConceptMatchGame: React.FC<ConceptMatchGameProps> = ({ onBack }) => {
  const [concepts, setConcepts] = useState<ConceptPair[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<ConceptPair[]>(
    [],
  );
  // Removed unused matches state
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(
    null,
  );
  const [correctMatches, setCorrectMatches] = useState<Set<number>>(new Set());
  const [incorrectMatches, setIncorrectMatches] = useState<Set<string>>(
    new Set(),
  );
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // @TODO: Replace with actual course-based data from database
  const conceptPairs: ConceptPair[] = [
    {
      id: 1,
      term: "Variable",
      definition:
        "A storage location with an associated name that contains data",
      course: "CS101",
    },
    {
      id: 2,
      term: "Function",
      definition: "A reusable block of code that performs a specific task",
      course: "CS101",
    },
    {
      id: 3,
      term: "Array",
      definition:
        "A collection of elements stored in contiguous memory locations",
      course: "CS101",
    },
    {
      id: 4,
      term: "Loop",
      definition: "A control structure that repeats a block of code",
      course: "CS101",
    },
    {
      id: 5,
      term: "Recursion",
      definition: "A programming technique where a function calls itself",
      course: "CS201",
    },
    {
      id: 6,
      term: "Class",
      definition:
        "A blueprint for creating objects in object-oriented programming",
      course: "CS201",
    },
  ];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const selectedConcepts = conceptPairs.slice(0, 5); // Use first 5 concepts
    setConcepts(selectedConcepts);
    setShuffledDefinitions(shuffleArray(selectedConcepts));
    // Removed setMatches as matches state is not used
    setCorrectMatches(new Set());
    setIncorrectMatches(new Set());
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setScore(0);
    setStartTime(Date.now());
    setGameCompleted(false);
  };

  const handleTermClick = (termId: number) => {
    if (correctMatches.has(termId)) return;
    setSelectedTerm(selectedTerm === termId ? null : termId);
    setSelectedDefinition(null);
  };

  const handleDefinitionClick = (definitionId: number) => {
    if (correctMatches.has(definitionId)) return;

    if (selectedTerm !== null) {
      // Create match
      // const newMatch: Match = {
      //   termId: selectedTerm,
      //   definitionId: definitionId
      // };

      const isCorrect = selectedTerm === definitionId;
      const matchKey = `${selectedTerm}-${definitionId}`;

      if (isCorrect) {
        setCorrectMatches((prev) => new Set([...prev, selectedTerm]));
        // Removed setMatches as matches state is not used

        // Calculate score with time bonus
        const timeBonus = Math.max(
          0,
          100 - Math.floor((Date.now() - startTime) / 1000),
        );
        setScore((prev) => prev + 50 + timeBonus);

        // Check if game is completed
        if (correctMatches.size + 1 === concepts.length) {
          setGameCompleted(true);
        }
      } else {
        setIncorrectMatches((prev) => new Set([...prev, matchKey]));
        setTimeout(() => {
          setIncorrectMatches((prev) => {
            const newSet = new Set(prev);
            newSet.delete(matchKey);
            return newSet;
          });
        }, 1000);
      }

      setSelectedTerm(null);
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(
        selectedDefinition === definitionId ? null : definitionId,
      );
      setSelectedTerm(null);
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const getCardStyle = (id: number, type: "term" | "definition") => {
    const isSelected =
      type === "term" ? selectedTerm === id : selectedDefinition === id;
    const isCorrect = correctMatches.has(id);
    const isIncorrect = Array.from(incorrectMatches).some((match) =>
      match.includes(id.toString()),
    );

    let baseStyle =
      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center min-h-[100px] flex items-center justify-center ";

    if (isCorrect) {
      baseStyle +=
        "bg-green-100 border-green-300 text-green-800 cursor-default ";
    } else if (isIncorrect) {
      baseStyle += "bg-red-100 border-red-300 text-red-800 animate-shake ";
    } else if (isSelected) {
      baseStyle +=
        "bg-secondary-200 border-secondary-400 text-secondary-800 scale-105 ";
    } else {
      baseStyle +=
        "bg-white border-gray-300 hover:border-secondary-300 hover:shadow-md ";
    }

    return baseStyle;
  };

  return (
    <div className="max-w-6xl mx-auto">
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
          <div className="flex items-center gap-2 bg-primary-100 px-3 py-1 rounded-lg">
            <Star className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-primary-800">{score}</span>
          </div>
          <div className="flex items-center gap-2 bg-lucerablue-1 px-3 py-1 rounded-lg">
            <Timer className="w-4 h-4 text-lucerablue-4" />
            <span className="font-bold text-lucerablue-5">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </span>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧩 Concept Match
        </h1>
        <p className="text-gray-600">
          Match terms with their definitions. Click a term, then click its
          matching definition!
        </p>
      </div>

      {gameCompleted && (
        <div className="bg-luceragreen-1 border border-luceragreen-3 rounded-lg p-6 mb-6 text-center">
          <CheckCircle className="w-12 h-12 text-luceragreen-4 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-luceragreen-5 mb-2">
            Congratulations!
          </h2>
          <p className="text-luceragreen-4 mb-4">
            You completed the game with a score of {score} points in{" "}
            {Math.floor((Date.now() - startTime) / 1000)} seconds!
          </p>
          <button
            onClick={resetGame}
            className="bg-luceragreen-3 text-white px-6 py-2 rounded-lg hover:bg-luceragreen-4"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Terms Column */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Terms
          </h3>
          <div className="space-y-3">
            {concepts.map((concept) => (
              <div
                key={`term-${concept.id}`}
                onClick={() => handleTermClick(concept.id)}
                className={getCardStyle(concept.id, "term")}
              >
                <div>
                  <p className="font-semibold">{concept.term}</p>
                  <span className="text-xs opacity-70">{concept.course}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Definitions Column */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Definitions
          </h3>
          <div className="space-y-3">
            {shuffledDefinitions.map((concept) => (
              <div
                key={`def-${concept.id}`}
                onClick={() => handleDefinitionClick(concept.id)}
                className={getCardStyle(concept.id, "definition")}
              >
                <p className="text-sm">{concept.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={resetGame}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Game
        </button>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ConceptMatchGame;
