"use client";
import React from "react";
import Link from "next/link";
import { iconForType } from "@/constants";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { PropsForEveryDashboardCard } from "@/lib/interfaces";

interface Option {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export default function Create({
}: PropsForEveryDashboardCard) {
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
      href: "/create/announcement",
    },
    {
      id: 5,
      type: "content",
      label: "Course Content",
      icon: React.createElement(iconForType("content")),
      href: "/create/content",
    },
    {
      id: 6,
      type: "poll",
      label: "New Poll",
      icon: React.createElement(iconForType("poll")),
      href: "/create/poll",
    },
    {
      id: 7,
      type: "report",
      label: "Generate Report",
      icon: React.createElement(iconForType("analytics")),
      href: "/create/report",
    },
  ];

  return (
    <div className="bg-yellow-100 rounded-lg shadow-md p-4">
      <h2 className="font-bold mb-4 text-yellow-700 text-lg">CREATE</h2>
      <div className="grid grid-cols-2 grid-rows-3 gap-3 auto-rows-fr">
        {options.map((opt) => (
          <PrimaryButton
            asChild
            key={opt.id}
            className="flex items-center gap-3 text-sm h-full min-h-[3.5rem] w-full"
          >
            <Link href={opt.href}>
              <span className="text-2xl text-yellow-900">{opt.icon}</span>
              <span className="text-left text-yellow-900 line-clamp-2 overflow-hidden">
                {opt.label}
              </span>
            </Link>
          </PrimaryButton>
        ))}
      </div>
    </div>
  );
}
