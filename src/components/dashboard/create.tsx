import React from "react";
import { Session } from "next-auth";
import { 
  MdOutlineBook, 
  MdOutlineClass, 
  MdOutlineAssignment, 
  MdOutlineAnnouncement,
  MdOutlinePoll,
  MdOutlineAssessment,
  MdOutlineLibraryBooks
} from "react-icons/md";

interface Option {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const Create: React.FC<Props> = ({ session, isTeacher }) => {
  // Complete options list with icons
  const dummyOptions: Option[] = [
    {
      id: 1,
      type: "course",
      label: "New Course",
      icon: <MdOutlineClass />
    },
    {
      id: 2, 
      type: "assignment",
      label: "New Assignment",
      icon: <MdOutlineAssignment />
    },
    {
      id: 3,
      type: "quiz",
      label: "New Quiz",
      icon: <MdOutlineAssessment />
    },
    {
      id: 4,
      type: "announcement",
      label: "New Announcement",
      icon: <MdOutlineAnnouncement />
    },
    {
      id: 5,
      type: "courseContent",
      label: "Course Content",
      icon: <MdOutlineLibraryBooks />
    },
    {
      id: 6,
      type: "poll",
      label: "New Poll",
      icon: <MdOutlinePoll />
    },
    {
      id: 7,
      type: "report",
      label: "Generate Report",
      icon: <MdOutlineBook />
    }
  ];

  const options = dummyOptions;

  return (
    <div className="bg-pink-50 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-4 text-pink-900 text-lg">CREATE</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 auto-rows-fr">
        {options.map((opt, index) => {
          const isLastItem = index === options.length - 1;
          const classParts = [];

          if (isLastItem) {
            const numItems = options.length;

            // Default behavior (2 columns)
            if (numItems % 2 === 1) {
              classParts.push("col-span-2");
            }

            // MD behavior (3 columns)
            if (numItems % 3 === 1) {
              // Last item is alone in a 3-column layout row
              classParts.push("md:col-span-3");
            } else if (numItems % 3 === 2) {
              // Last item is the second of two in a 3-column layout row
              classParts.push("md:col-span-2");
            } else {
              // numItems % 3 === 0: Row is full for md, or it's a single item that needs specific handling.
              // This ensures it takes md:col-span-1 if col-span-2 was applied for smaller screens
              // and the md row is actually full or it's the only item in its row for md.
              classParts.push("md:col-span-1");
            }
          }
          const itemSpanClass = classParts.join(" ");

          return (
            <button 
              key={opt.id} 
              className={`flex flex-col items-center justify-center gap-2 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors text-sm h-full min-h-[5rem] ${itemSpanClass}`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-center w-full line-clamp-2 overflow-ellipsis">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Create;
