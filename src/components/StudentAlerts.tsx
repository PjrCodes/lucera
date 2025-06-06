import React from "react";

interface Alert {
  id: number;
  message: string;
  date: string;
}

interface Props {
  alerts: Alert[];
}

const StudentAlerts: React.FC<Props> = ({ alerts }) => (
  <div className="bg-yellow-50 rounded shadow p-4 min-h-[220px]">
    <h2 className="font-bold mb-2 text-yellow-900">Student Alerts</h2>
    <ul>
      {alerts.map((alert) => (
        <li key={alert.id} className="mb-1">
          <span>{alert.message}</span>{" "}
          <span className="text-gray-400 text-xs">({alert.date})</span>
        </li>
      ))}
    </ul>
  </div>
);

export default StudentAlerts;
