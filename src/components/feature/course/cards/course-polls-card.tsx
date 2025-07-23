import { MessageSquare } from "lucide-react";

interface PollOrAnnouncement {
  id: number;
  type: string;
  question: string;
  responses: number | null;
  active?: boolean;
}

export default function CoursePollsCard({
  pollsAndAnnouncements,
}: {
  pollsAndAnnouncements: PollOrAnnouncement[];
}) {
  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Polls & Announcements
          </h2>
          <p className="text-primary-500">
            Course interactions and updates.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {pollsAndAnnouncements.map((item) => (
          <div
            key={item.id}
            className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow py-3 px-4"
          >
            <h4 className="text-base font-medium text-primary-900 mb-1">
              {item.type === "poll" ? "Poll" : "Announcement"}: {item.question}
            </h4>
            {item.responses !== null && (
              <span className="text-sm text-primary-600">
                Responses: {item.responses}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
