import React from "react";
import { X, Star, Trophy, Target, Users } from "lucide-react";

interface PointsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PointsInfoModal: React.FC<PointsInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pointSources = [
    {
      icon: Target,
      title: "Assignment Completion",
      points: "10-50 pts",
      description: "Points based on assignment complexity and score achieved"
    },
    {
      icon: Trophy,
      title: "Badge Achievements",
      points: "50-250 pts",
      description: "Earn points when you unlock new badges for various accomplishments"
    },
    {
      icon: Users,
      title: "Class Participation",
      points: "5-25 pts",
      description: "Active participation in discussions, forums, and group activities"
    },
    {
      icon: Star,
      title: "Bonus Activities",
      points: "15-100 pts",
      description: "Extra credit activities, challenges, and special events"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-lucerayellow-4" />
              <h2 className="text-2xl font-bold text-gray-800">How Points Work</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Overview */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              The Lighthouse points system rewards your academic achievements and engagement.
              Points are automatically awarded based on your activities and help determine your
              position on the leaderboard.
            </p>
          </div>

          {/* Point Sources */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ways to Earn Points</h3>
            <div className="space-y-4">
              {pointSources.map((source, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-lucerablue-1 p-2 rounded-lg">
                    <source.icon className="w-5 h-5 text-lucerablue-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">{source.title}</h4>
                      <span className="text-lucerayellow-5 font-bold text-sm">{source.points}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{source.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking System */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ranking System</h3>
            <div className="bg-lucerablue-1 p-4 rounded-lg">
              <p className="text-lucerablue-5 text-sm leading-relaxed">
                Your rank is determined by your total points compared to other students.
                Points are accumulated across all your courses and activities. The leaderboard
                updates in real-time as you earn more points through your academic journey.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tips to Maximize Points</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lucerayellow-4 mt-1">•</span>
                Submit assignments early to avoid point deductions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lucerayellow-4 mt-1">•</span>
                Actively participate in class discussions and forums
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lucerayellow-4 mt-1">•</span>
                Complete bonus activities and challenges when available
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lucerayellow-4 mt-1">•</span>
                Work towards earning badges for significant point bonuses
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsInfoModal;
