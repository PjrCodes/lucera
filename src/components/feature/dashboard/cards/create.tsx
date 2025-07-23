"use client";
import React from "react";
import Link from "next/link";
import { iconForType } from "@/lib/constants";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import { BadgePlus } from "lucide-react";

interface Option {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export default function Create({}: SessionAndDataProps) {
  // Complete options list with icons
  const options: Option[] = [
    {
      id: 1,
      type: "course",
      label: "New Course",
      icon: React.createElement(iconForType("course")),
      href: "/create/course",
    },
    {
      id: 2,
      type: "assignment",
      label: "New Assignment",
      icon: React.createElement(iconForType("assignment")),
      href: "/create/assignment",
    },
    {
      id: 4,
      type: "announcement",
      label: "Announcement",
      icon: React.createElement(iconForType("announcement")),
      href: "/messages",
    },
    {
      id: 5,
      type: "content",
      label: "Course Content",
      icon: React.createElement(iconForType("content")),
      href: "/create/content",
    },
    {
      id: 7,
      type: "report",
      label: "Generate Report",
      icon: React.createElement(iconForType("analytics")),
      href: "/progress",
    },
  ];

  return (
    <div className="bg-white border-2 border-primary-100 rounded-lg shadow-md p-4">
      <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <BadgePlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Create
            </h2>
            <p className="text-primary-500">
              Create new data on the platform.
            </p>
          </div>
        </div>
      <div className="grid grid-cols-2 grid-rows-3 gap-3 auto-rows-fr">
        {options.map((opt) => (
          <PrimaryButton
            asChild
            key={opt.id}
            className="flex items-center gap-3 text-sm h-full min-h-[3.5rem] w-full"
            // variant="outline"
          >
            <Link
              href={opt.href}
              className="text-left flex items-center gap-3 overflow-ellipsis"
            >
              {/* react element opt.icon */}
              <span className="text-primary-25">{opt.icon}</span>
              <span className="line-clamp-2 text-primary-25">{opt.label}</span>
            </Link>
          </PrimaryButton>
        ))}
      </div>
    </div>
  );
}
