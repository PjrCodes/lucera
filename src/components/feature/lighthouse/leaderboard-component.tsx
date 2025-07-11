"use client";
import React, { useState } from "react";
import { Trophy, Medal, Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface LeaderboardEntry {
  id: number;
  name: string;
  badges: number;
  rank: number;
  accountAge: number; // in days - for tie-breaking (older accounts rank lower)
  avatar?: string;
  isCurrentUser?: boolean;
}

interface Course {
  code: string;
  name: string;
}

interface LeaderboardComponentProps {
  isTeacher: boolean;
  showHeader?: boolean;
  showCourseFilter?: boolean;
  initialCourse?: string;
}

export default function LeaderboardComponent({
  isTeacher,
  showHeader = true,
  showCourseFilter = true,
  initialCourse = "university"
}: LeaderboardComponentProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const RECORDS_PER_PAGE = 10;

  const courses: Course[] = [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Algorithms" },
    { code: "CS401", name: "Software Engineering" },
  ];

  // Raw leaderboard data (before sorting and ranking) - max 8 badges
  const universityLeaderboardData: Omit<LeaderboardEntry, 'rank'>[] = [
    { id: 1, name: "Alice Johnson", badges: 8, accountAge: 520 }, // ~1.4 years old account - full badges but took long time
    { id: 2, name: "Bob Chen", badges: 8, accountAge: 180 }, // ~6 months old account - ranks higher due to newer account
    { id: 3, name: "Carol Davis", badges: 7, accountAge: 350 }, // ~1 year old account
    { id: 4, name: "David Wilson", badges: 7, accountAge: 90 }, // ~3 months old account (ranks higher due to newer account)
    { id: 5, name: "Emma Brown", badges: 6, accountAge: 450 }, // ~1.2 years old account
    { id: 6, name: "Frank Miller", badges: 6, accountAge: 200 }, // ~6.5 months old account (ranks higher due to newer account)
    { id: 7, name: "Grace Lee", badges: 5, accountAge: 150 }, // ~5 months old account
    { id: 8, name: "Henry Taylor", badges: 5, accountAge: 300 }, // ~10 months old account
    { id: 9, name: "Ivy Zhang", badges: 4, accountAge: 120 }, // ~4 months old account
    { id: 10, name: "Jack Smith", badges: 4, accountAge: 250 }, // ~8 months old account
    { id: 11, name: "Kate Anderson", badges: 4, accountAge: 100 }, // ~3.3 months old account (ranks highest among 4-badge users)
    { id: 12, name: "Liam Garcia", badges: 4, accountAge: 400 }, // ~1.1 years old account
    { id: 13, name: "Mia Rodriguez", badges: 4, accountAge: 60 }, // ~2 months old account (ranks very high due to new account)
    { id: 14, name: "Noah Martinez", badges: 4, accountAge: 200 }, // ~6.5 months old account
    {
      id: 15,
      name: "You",
      badges: 4,
      accountAge: 150, // ~5 months old account
      isCurrentUser: true,
    },
    { id: 16, name: "Olivia Thompson", badges: 4, accountAge: 300 }, // ~10 months old account
    { id: 17, name: "Paul White", badges: 3, accountAge: 80 }, // ~2.7 months old account
    { id: 18, name: "Quinn Davis", badges: 3, accountAge: 220 }, // ~7 months old account
    { id: 19, name: "Ruby Johnson", badges: 2, accountAge: 50 }, // ~1.7 months old account
    { id: 20, name: "Sam Wilson", badges: 2, accountAge: 180 }, // ~6 months old account
  ];

  const courseLeaderboardsData: Record<string, Omit<LeaderboardEntry, 'rank'>[]> = {
    CS101: [
      { id: 1, name: "Bob Chen", badges: 3, accountAge: 180 },
      { id: 2, name: "Alice Johnson", badges: 3, accountAge: 520 }, // Same badges, but older account so ranks lower
      { id: 3, name: "Carol Davis", badges: 2, accountAge: 350 },
      { id: 4, name: "David Wilson", badges: 2, accountAge: 90 }, // Same badges, newer account so ranks higher
      {
        id: 5,
        name: "You",
        badges: 2,
        accountAge: 150,
        isCurrentUser: true,
      },
    ],
    CS201: [
      { id: 1, name: "Emma Brown", badges: 2, accountAge: 450 },
      { id: 2, name: "Alice Johnson", badges: 2, accountAge: 520 }, // Same badges, older account so ranks lower
      { id: 3, name: "Carol Davis", badges: 1, accountAge: 350 },
      {
        id: 4,
        name: "You",
        badges: 1,
        accountAge: 150,
        isCurrentUser: true,
      },
    ],
    CS301: [
      { id: 1, name: "Frank Miller", badges: 3, accountAge: 200 },
      { id: 2, name: "Grace Lee", badges: 2, accountAge: 150 },
      {
        id: 3,
        name: "You",
        badges: 1,
        accountAge: 150,
        isCurrentUser: true,
      },
    ],
    CS401: [
      { id: 1, name: "Bob Chen", badges: 2, accountAge: 180 },
      { id: 2, name: "Alice Johnson", badges: 2, accountAge: 520 }, // Same badges, older account so ranks lower
      {
        id: 3,
        name: "You",
        badges: 2,
        accountAge: 150, // Newer account, ranks higher than Alice
        isCurrentUser: true,
      },
    ],
  };

  // Function to sort and rank leaderboard entries
  const sortAndRankLeaderboard = (data: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] => {
    // Sort by badges (descending), then by account age (ascending - newer accounts rank higher)
    const sorted = [...data].sort((a, b) => {
      if (a.badges !== b.badges) {
        return b.badges - a.badges; // Higher badges first
      }
      return a.accountAge - b.accountAge; // For same badges, newer accounts (lower age) rank higher
    });

    // Assign ranks
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  };

  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    let rawData: Omit<LeaderboardEntry, 'rank'>[];
    if (selectedCourse === "university") {
      rawData = universityLeaderboardData;
    } else {
      rawData = courseLeaderboardsData[selectedCourse] || [];
    }

    // Sort and rank the data
    const leaderboard = sortAndRankLeaderboard(rawData);

    // Filter out current user entry for teachers
    if (isTeacher) {
      return leaderboard.filter((entry) => !entry.isCurrentUser);
    }

    return leaderboard;
  };

  const getPaginatedLeaderboard = () => {
    const fullLeaderboard = getCurrentLeaderboard();
    const totalRecords = fullLeaderboard.length;
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);

    // Find current user
    const currentUser = fullLeaderboard.find(entry => entry.isCurrentUser);

    // Calculate start and end indexes for current page
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;

    // Get records for current page
    const paginatedRecords = fullLeaderboard.slice(startIndex, endIndex);

    // If current user is not on this page and is not a teacher, add them appropriately
    if (!isTeacher && currentUser && !paginatedRecords.some(entry => entry.isCurrentUser)) {
      // Check if current user has a better rank (lower number = higher rank) than the worst rank on current page
      const worstRankOnPage = Math.max(...paginatedRecords.map(entry => entry.rank));
      const bestRankOnPage = Math.min(...paginatedRecords.map(entry => entry.rank));

      if (currentUser.rank < bestRankOnPage) {
        // Current user has a better rank than everyone on this page - prepend at top
        paginatedRecords.unshift(currentUser);
      } else if (currentUser.rank > worstRankOnPage) {
        // Current user has a worse rank than everyone on this page - append at bottom
        paginatedRecords.push(currentUser);
      }
    }

    return {
      records: paginatedRecords,
      totalPages,
      totalRecords,
      currentPage,
    };
  };

  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    setCurrentPage(1); // Reset to first page when changing course
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginationData = getPaginatedLeaderboard();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-primary-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return (
      <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="p-4 bg-secondary-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-secondary-600" />
              <div>
                <h2 className="font-bold text-secondary-800">
                  {selectedCourse === "university"
                    ? "University Leaderboard"
                    : `${selectedCourse} Leaderboard`}
                </h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Page {paginationData.currentPage} of {paginationData.totalPages} • {paginationData.totalRecords} total students
                </p>
              </div>
            </div>

            {/* Course Filter */}
            {showCourseFilter && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-secondary-600" />
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="university">University Wide</option>
                  {courses.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Filter as separate section if header is hidden */}
      {!showHeader && showCourseFilter && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-secondary-600" />
            <h3 className="font-semibold text-secondary-800">Filter by Course</h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => handleCourseChange("university")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCourse === "university"
                  ? "bg-secondary-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              University Wide
            </button>
            {courses.map((course) => (
              <button
                key={course.code}
                onClick={() => handleCourseChange(course.code)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCourse === course.code
                    ? "bg-secondary-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {course.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="divide-y divide-gray-100">
        {paginationData.records.map((entry) => (
          <div
            key={entry.id}
            className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              entry.isCurrentUser
                ? "bg-primary-100 border-l-4 border-primary-400"
                : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {getRankIcon(entry.rank)}
              <div>
                <h3
                  className={`font-semibold ${entry.isCurrentUser ? "text-primary-800" : "text-secondary-800"}`}
                >
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs font-normal">
                      (You)
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold">{entry.badges}</div>
                <span className="text-gray-500 text-xs">badges</span>
              </div>
              <div className="text-center">
                <div className="font-bold">{Math.floor(entry.accountAge / 30)}mo</div>
                <span className="text-gray-500 text-xs">account age</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {paginationData.totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      isActive={currentPage === 1}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Current page and adjacent pages */}
              {(() => {
                const pages = [];
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(paginationData.totalPages, currentPage + 1);

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return pages;
              })()}

              {/* Last page */}
              {currentPage < paginationData.totalPages - 1 && (
                <>
                  {currentPage < paginationData.totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(paginationData.totalPages)}
                      isActive={currentPage === paginationData.totalPages}
                      className="cursor-pointer"
                    >
                      {paginationData.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(paginationData.totalPages, currentPage + 1))}
                  className={currentPage === paginationData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
