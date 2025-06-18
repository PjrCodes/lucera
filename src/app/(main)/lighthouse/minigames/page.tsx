"use client";
import React, { useState } from "react";
import { ArrowLeft, Puzzle, Zap, Brain } from "lucide-react";
import Link from "next/link";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import WordWhizGame from "@/components/feature/lighthouse/games/word-whiz-game";
import ConceptMatchGame from "@/components/feature/lighthouse/games/concept-match-game";
import QuizBlitzGame from "@/components/feature/lighthouse/games/quiz-blitz-game";

type GameType = "menu" | "word-whiz" | "concept-match" | "quiz-blitz";

export default function MinigamesPage() {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");

  const games = [
    {
      id: "word-whiz",
      title: "Word Whiz",
      description: "Solve subject-specific word puzzles and anagrams",
      icon: Puzzle,
      color: "bg-lucerablue-3 hover:bg-lucerablue-4",
      textColor: "text-white",
    },
    {
      id: "concept-match",
      title: "Concept Match",
      description: "Match terms with their definitions",
      icon: Zap,
      color: "bg-luceragreen-3 hover:bg-luceragreen-4",
      textColor: "text-white",
    },
    {
      id: "quiz-blitz",
      title: "Quiz Blitz",
      description: "Fast-paced multiple choice questions",
      icon: Brain,
      color: "bg-lucerapurple-3 hover:bg-lucerapurple-4",
      textColor: "text-white",
    },
  ];

  const renderGame = () => {
    switch (currentGame) {
      case "word-whiz":
        return <WordWhizGame onBack={() => setCurrentGame("menu")} />;
      case "concept-match":
        return <ConceptMatchGame onBack={() => setCurrentGame("menu")} />;
      case "quiz-blitz":
        return <QuizBlitzGame onBack={() => setCurrentGame("menu")} />;
      default:
        return (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-lucerarose-1 text-lucerarose-5 px-8 py-4 rounded-lg shadow-md border border-lucerarose-2">
                <Brain className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Minigames</h1>
                  <p className="text-sm opacity-80">Learn while you play!</p>
                </div>
              </div>
            </div>

            {/* Back to Lighthouse */}
            <div className="mb-6">
              <Link
                href="/lighthouse"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Lighthouse
              </Link>
            </div>

            {/* Game Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id as GameType)}
                  className={`${game.color} ${game.textColor} p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-left`}
                >
                  <game.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <p className="opacity-90">{game.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SetHeaderClientComponent title="MINIGAMES" />
      <main className="min-h-screen bg-gray-50 p-6">
        {renderGame()}
      </main>
    </>
  );
}
