import React from "react";
import { Session } from "next-auth";

interface Option {
  id: number;
  type: string;
  label: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const Create: React.FC<Props> = ({ session, isTeacher }) => {
  // Dummy data for create options - replace with actual data fetching later
  const dummyOptions: Option[] = [
    {
      id: 1,
      type: "course",
      label: "New Course"
    },
    {
      id: 2, 
      type: "assignment",
      label: "New Assignment"
    },
    {
      id: 3,
      type: "quiz",
      label: "New Quiz"
    },
    {
      id: 4,
      type: "announcement",
      label: "New Announcement"
    }
  ];

  const options = dummyOptions;

  return (
    <div className="bg-pink-50 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-2 text-pink-900">Create</h2>
      <ul>
        {options.map((opt) => (
          <li key={opt.id} className="mb-1">
            <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Create;
