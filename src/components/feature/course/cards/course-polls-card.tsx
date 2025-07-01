import { FiMessageSquare } from "react-icons/fi";

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
    <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FiMessageSquare />
        Polls & Announcements
      </h2>
      <div className="space-y-3">
        {pollsAndAnnouncements.map((item) => (
          <div key={item.id} className="border-l-4 border-accent-200 pl-3 py-2">
            <h4 className="text-sm font-medium text-primary-900 mb-1">
              {item.type === "poll" ? "Poll" : "Announcement"}: {item.question}
            </h4>
            {item.responses !== null && (
              <span className="text-xs text-primary-500">
                Responses: {item.responses}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
