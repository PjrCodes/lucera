"use client";
import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { iconForType } from "@/constants";

interface Option {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
  href: string;
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
      icon: React.createElement(iconForType("course")),
      href: "/create/course"
    },
    {
      id: 2, 
      type: "assignment",
      label: "New Assignment",
      icon: React.createElement(iconForType("assignment")),
      href: "/create/assignment"
    },
    {
      id: 4,
      type: "announcement",
      label: "New Announcement",
      icon: React.createElement(iconForType("announcement")),
      href: "/create/announcement"
    },
    {
      id: 5,
      type: "content",
      label: "Course Content",
      icon: React.createElement(iconForType("content")),
      href: "/create/content"
    },
    {
      id: 6,
      type: "poll",
      label: "New Poll",
      icon: React.createElement(iconForType("poll")),
      href: "/create/poll"
    },
    {
      id: 7,
      type: "report",
      label: "Generate Report",
      icon: React.createElement(iconForType("analytics")),
      href: "/create/report"
    }
  ];

  const options = dummyOptions;

  return (
    <div className="bg-lucerarose-1 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-4 text-lucerarose-5 text-lg">CREATE</h2>
      <div className="grid grid-cols-2 grid-rows-3 gap-3 auto-rows-fr">
        {options.map((opt) => (
          <Link href={opt.href} key={opt.id} className="contents">
            <button
              className="flex flex-row items-center justify-start gap-3 bg-lucerarose-3 text-white p-3 rounded-lg hover:bg-lucerarose-4 transition-colors text-sm h-full min-h-[3.5rem] cursor-pointer w-full"
              type="button"
            >
              <span className="text-2xl flex-shrink-0">{opt.icon}</span>
              <span className="text-left w-full break-words">{opt.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Create;
