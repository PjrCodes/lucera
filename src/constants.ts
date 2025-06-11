import { MdMenuBook, MdOutlineAnalytics, MdOutlineAnnouncement, MdOutlineAssignment, MdOutlineLibraryBooks, MdOutlinePoll } from "react-icons/md";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { PiExam } from "react-icons/pi";
import { MdOutlineQuiz } from "react-icons/md";
import { RiTestTubeLine } from "react-icons/ri";

export const DASHBOARD_ELEMENT_TO_NAME = {
  PROGRESS: 'Progress',
  BOOKMARKS: 'Bookmarks',
  UPCOMING_DEADLINES: 'Upcoming Deadlines',
  WHATS_NEXT: "What's Next",
  YOUR_BADGES: 'Your Badges',
  ANNOUNCEMENTS: 'Announcements',
  RECENTLY_ACCESSED: 'Recently Accessed',
  STUDENT_ALERTS: 'Student Alerts',
  CLASS_PROGRESS: 'Class Progress',
  CREATE: 'Create'
};

export const ourIconWidgets = {
    "assignment": MdOutlineAssignment,
    "content": MdOutlineLibraryBooks,
    "poll": MdOutlinePoll,
    "course": MdMenuBook,
    "announcement": MdOutlineAnnouncement,
    "analytics": MdOutlineAnalytics,
    "exam": PiExam,
    "project": AiOutlineFundProjectionScreen,
    "quiz": MdOutlineQuiz,
    "lab": RiTestTubeLine,
    "fallback": MdOutlineLibraryBooks,
};

// colors based on type

export const ourIconColors = {
    "assignment": "bg-luceragreen-1 text-luceragreen-5",
    "content": "bg-lucerablue-1 text-lucerablue-5",
    "polls": "bg-lucerayellow-1 text-lucerayellow-5",
    "course": "bg-lucerabrown-1 text-lucerabrown-5",
    "announcement": "bg-lucerablue-2 text-lucerablue-5",
    "analytics": "bg-lucerablue-3 text-lucerablue-5",
    "exam": "bg-lucerapurple-1 text-lucerapurple-5",
    "project": "bg-lucerayellow-2 text-lucerayellow-5",
    "quiz": "bg-lucerablue-2 text-lucerablue-5",
    "lab": "bg-lucerabrown-2 text-lucerabrown-5",
    "fallback": "bg-gray-100 text-gray-800", // Fallback color
}
export const colorClassForType = (type: string) => {
    // simply return color based on type
    const color = ourIconColors[type.toLowerCase() as keyof typeof ourIconColors];
    if (color) {
        return color;
    } else {
        return ourIconColors["fallback"];
    }
}

export const iconForType = (type: string) => {
  // simply return icon based on type
  const icon = ourIconWidgets[type.toLowerCase() as keyof typeof ourIconWidgets];
  if (icon) {
    return icon;
  } else {
    return ourIconWidgets["fallback"];
  }
};