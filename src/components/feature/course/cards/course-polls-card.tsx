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
    <div className="bg-white rounded-xl shadow border border-primary-100 p-6">
      <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
        <FiMessageSquare className="w-5 h-5 text-primary-900" />
        <span>Polls & Announcements</span>
      </h2>
      <div className="space-y-3">
        {pollsAndAnnouncements.map((item) => (
          <div
            key={item.id}
            className="border-l-4 border-accent-200 pl-3 py-2 hover:bg-primary-50 rounded transition-colors"
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
