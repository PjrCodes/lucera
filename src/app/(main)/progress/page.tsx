import { auth } from "@/lib/auth";
import { getUserData } from "@/lib/database/auth";
import Courses from "@/components/feature/dashboard/cards/courses";
import React from "react";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-600">
        <h1 className="text-3xl font-bold mb-4">Progress Dashboard</h1>
        <p>Please sign in to view your progress.</p>
      </div>
    );
  }

  const userData = await getUserData(session.user.id!);
  if (!userData) {
    redirect("/");
  }

  const isTeacher = userData.role === "teacher";

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Progress Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <Courses userData={userData} session={session} />
        </section>
        <aside className="md:col-span-1">
          {isTeacher ? (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
                📊 Course Analytics
              </h2>
              <div className="space-y-3">
                <div className="text-gray-700 text-sm">
                  <strong>Student Performance Breakdown</strong>
                  <ul className="list-disc list-inside mt-2 text-gray-600 text-xs">
                    <li>See which students are excelling or struggling in each course.</li>
                    <li>Highlight students with &lt; 50% progress in red.</li>
                    <li>Click a course for detailed analytics.</li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <span className="font-semibold text-red-700">Alert:</span> Students below threshold will be highlighted here in future updates.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                🏆 Your Achievements
              </h2>
              <div className="space-y-3">
                <div className="text-gray-700 text-sm">
                  <strong>Track your progress across all enrolled courses.</strong>
                  <ul className="list-disc list-inside mt-2 text-gray-600 text-xs">
                    <li>See your completion percentage for each course.</li>
                    <li>Click a course to view detailed breakdown and upcoming deadlines.</li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <span className="font-semibold text-blue-700">Tip:</span> Stay consistent to unlock badges and rewards!
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
