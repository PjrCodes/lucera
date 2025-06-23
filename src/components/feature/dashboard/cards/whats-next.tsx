import React from "react";
import Link from "next/link";
import { PropsForEveryDashboardCard } from "@/lib/interfaces";

interface NextAction {
  id: number;
  action: string;
  subject: string;
  link: string;
  dueDate?: string;
}

export default function WhatsNext({ session, userData }: PropsForEveryDashboardCard) {
  // Mock data for what's next - replace with actual data fetching later
  const unreadMessages = 3;
  
  const nextActions: NextAction[] = [
    {
      id: 1,
      action: "Revise",
      subject: "Threads",
      link: "/courses/threads",
      dueDate: "test on 9th June"
    },
    {
      id: 2,
      action: "Finish",
      subject: "Discrete Mathematics",
      link: "/courses/discrete-math",
      dueDate: "assignment, due on 7th June"
    }
  ];

  const focusSessionTime = "9:00 PM";
  const nextEvent = "Project Meeting";

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col">
      <h2 className="text-lg font-bold text-primary-700 mb-4">
        WHAT&apos;S NEXT
      </h2>
      
      {/* Unread Messages */}
      <div className="mb-4">
        <p className="text-primary-700 mb-2">
          You have <span className="font-bold">{unreadMessages} important</span> unread messages.
        </p>
      </div>

      {/* Next Actions */}
      <div className="mb-4">
        <p className="text-primary-700 mb-3">
          Based on past progress, you should do the following next:
        </p>
        <ul className="space-y-2">
          {nextActions.map((action) => (
            <li key={action.id} className="flex items-start gap-2">
              <span className="text-primary-700">•</span>
              <div className="text-primary-700">
                {action.action}{" "}
                <Link 
                  href={action.link}
                  className="font-bold underline hover:text-primary-800 transition-colors"
                >
                  {action.subject}
                </Link>
                {action.dueDate && (
                  <>
                    {" "}for your upcoming{" "}
                    <span className="font-bold">{action.dueDate}</span>.
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Focus Session */}
      <div className="mt-auto">
        <p className="text-primary-700">
          Start a focus session at{" "}
          <span className="font-bold underline">{focusSessionTime}</span>, after your {nextEvent}.
        </p>
      </div>
    </div>
  );
}
