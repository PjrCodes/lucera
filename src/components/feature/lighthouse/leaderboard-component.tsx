"use client";
import React, { useState } from "react";
import { Trophy, Medal, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (rank === 1) return <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
    return (
      <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-primary-700 font-bold text-sm sm:text-base">
        #{rank}
      </span>
    );
  };

  return (
    <Card className="bg-white border-primary-200 shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      {showHeader && (
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">
                  {selectedCourse === "university"
                    ? "University Leaderboard"
                    : `${selectedCourse} Leaderboard`}
                </CardTitle>
                <CardDescription className="text-primary-600/70 text-xs sm:text-sm">
                  Page {paginationData.currentPage} of {paginationData.totalPages} • {paginationData.totalRecords} total students
                </CardDescription>
              </div>
            </div>

            {/* Course Filter */}
            {showCourseFilter && (
              <div className="flex items-center gap-2 ml-auto">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="text-xs sm:text-sm px-2 py-1 border border-primary-200 rounded bg-white hover:border-primary-300 transition-colors"
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
        </CardHeader>
      )}

      {/* Course Filter as separate section if header is hidden */}
      {!showHeader && showCourseFilter && (
        <div className="p-3 sm:p-4 border-b border-primary-200 bg-primary-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1 bg-primary-100 rounded-lg">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-primary-800 text-sm sm:text-base">Filter by Course</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCourseChange("university")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                selectedCourse === "university"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white text-primary-700 hover:bg-primary-100 border border-primary-200"
              }`}
            >
              University Wide
            </button>
            {courses.map((course) => (
              <button
                key={course.code}
                onClick={() => handleCourseChange(course.code)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                  selectedCourse === course.code
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-white text-primary-700 hover:bg-primary-100 border border-primary-200"
                }`}
              >
                {course.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <CardContent className="p-0">
        <div className="divide-y divide-primary-100">
          {paginationData.records.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 sm:p-4 flex items-center justify-between hover:bg-primary-50 transition-colors ${
                entry.isCurrentUser
                  ? "bg-primary-100 border-l-4 border-primary-400"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {getRankIcon(entry.rank)}
                <div>
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      entry.isCurrentUser ? "text-primary-800" : "text-primary-700"
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs font-normal text-primary-600">
                        (You)
                      </span>
                    )}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary-800">{entry.badges}</div>
                  <span className="text-primary-600/70 text-xs">badges</span>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary-800">{Math.floor(entry.accountAge / 30)}mo</div>
                  <span className="text-primary-600/70 text-xs">account age</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {paginationData.totalPages > 1 && (
          <div className="p-3 sm:p-4 border-t border-primary-200 bg-primary-50/50">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={`text-xs sm:text-sm ${
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-primary-100 text-primary-700"
                    }`}
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        isActive={currentPage === 1}
                        className="cursor-pointer text-xs sm:text-sm hover:bg-primary-100 text-primary-700"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis className="text-primary-600" />
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
                          className={`cursor-pointer text-xs sm:text-sm ${
                            currentPage === i
                              ? "bg-primary-500 text-white hover:bg-primary-600"
                              : "hover:bg-primary-100 text-primary-700"
                          }`}
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
                        <PaginationEllipsis className="text-primary-600" />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(paginationData.totalPages)}
                        isActive={currentPage === paginationData.totalPages}
                        className={`cursor-pointer text-xs sm:text-sm ${
                          currentPage === paginationData.totalPages
                            ? "bg-primary-500 text-white hover:bg-primary-600"
                            : "hover:bg-primary-100 text-primary-700"
                        }`}
                      >
                        {paginationData.totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(paginationData.totalPages, currentPage + 1))}
                    className={`text-xs sm:text-sm ${
                      currentPage === paginationData.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-primary-100 text-primary-700"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
