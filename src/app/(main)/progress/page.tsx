import { getSessionAndUserData } from "@/lib/database-service/auth";
import React from "react";

export default async function ProgressPage() {
  const { userData } = await getSessionAndUserData();

  const isTeacher = userData.role === "teacher";

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary-700">
        Progress Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {isTeacher ? (
          <div className="bg-primary-100 rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-primary-950 flex items-center gap-2">
              Course Analytics
            </h2>
            <div className="space-y-3">
              <div className="text-primary-900">
                <strong>Student Performance Breakdown</strong>
                <ul className="list-disc list-inside mt-2 text-primary-900 text-sm">
                  <li>
                    See which students are excelling or struggling in each
                    course.
                  </li>
                  <li>Highlight students with &lt; 50% progress in red.</li>
                  <li>Click a course for detailed analytics.</li>
                </ul>
              </div>
              <div className="text-danger-700 font-bold">
                Page under development.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-primary-100 rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-primary-950 flex items-center gap-2">
              Your Progress
            </h2>
            <div className="space-y-3">
              <div className="text-primary-900">
                <strong>Performance Breakdown</strong>
                <ul className="list-disc list-inside mt-2 text-primary-900 text-sm">
                  <li>See how you are performing in your courses.</li>
                  <li>
                    Course completion stats such as topics covered, lectures
                    completed, etc.
                  </li>
                  <li>All the grades in one place.</li>
                </ul>
              </div>
              <div className="text-danger-700 font-bold">
                Page under development.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
