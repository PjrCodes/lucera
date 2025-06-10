import React from "react";
import { Session } from "next-auth";
import { MdWarningAmber } from "react-icons/md";

interface Alert {
  id: number;
  message: string;
  detail?: string;
  date: string;
  severity: "high" | "medium" | "low";
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const StudentAlerts: React.FC<Props> = ({ session, isTeacher }) => {
  // Example alerts for teachers, sorted by severity
  const dummyAlerts: Alert[] = [
    {
      id: 1,
      message: "Many students struggling with Recursion",
      detail: "50/75 students are having difficulty with the 'Recursion' topic in CS101.",
      date: "2024-06-10",
      severity: "high"
    },
    {
      id: 2,
      message: "Multiple late submissions",
      detail: "Student Priya S. has submitted the last 2 assignments late in CS201.",
      date: "2024-06-09",
      severity: "medium"
    },
    {
      id: 3,
      message: "Quiz average below passing",
      detail: "Average score for Quiz 3 in CS301 is below passing (42%).",
      date: "2024-06-08",
      severity: "low"
    },
  ];

  // Sort by severity: high > medium > low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const alerts = dummyAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="bg-lucerayellow-1 rounded-lg shadow-md p-4 md:px-6 min-h-[220px] flex flex-col">
      <h2 className="text-lg font-bold text-lucerayellow-5 mb-4 flex items-center gap-2">
        STUDENT ALERTS
      </h2>
      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-lucerayellow-4">
          <MdWarningAmber className="text-5xl mb-2" />
          <p className="text-lg">No major student issues detected.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <a
                href="#"
                className="bg-white/80 rounded-lg shadow px-3 py-2 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer"
                tabIndex={0}
                aria-label={alert.message + (alert.detail ? `: ${alert.detail}` : "")}
              >
                <span
                  className={
                    `flex items-center h-full text-2xl ${
                      alert.severity === "high"
                        ? "text-lucerared-4"
                        : alert.severity === "medium"
                        ? "text-lucerayellow-4"
                        : "text-lucerablue-4"
                    }`
                  }
                  style={{ minHeight: "2.5rem" }}
                >
                  <MdWarningAmber />
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-lucerayellow-5 text-sm md:text-base">
                    {alert.message}
                  </div>
                  {alert.detail && (
                    <div className="text-xs text-gray-800 mt-0.5">
                      {alert.detail}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{alert.date}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentAlerts;
