"use client";
import React from "react";
import Link from "next/link";
import { iconForType } from "@/lib/constants";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";

interface Option {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export default function Create({}: PropsForEveryDashboardCard) {
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
      label: "New Announcement",
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
    <div className="bg-primary-100 rounded-lg shadow-md p-4">
      <h2 className="font-bold mb-4 text-primary-700 text-lg">CREATE</h2>
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
              <span>{opt.icon}</span>
              <span className="line-clamp-2">{opt.label}</span>
            </Link>
          </PrimaryButton>
        ))}
      </div>
    </div>
  );
}
