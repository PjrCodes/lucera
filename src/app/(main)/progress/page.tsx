import { getSessionAndUserData } from "@/lib/database-service/auth";
import React from "react";
import TeacherProgressDashboard from "@/components/feature/progress/teacher-progress-dashboard";
import StudentProgressView from "@/components/feature/progress/student-progress-view";

export default async function ProgressPage() {
  const { userData } = await getSessionAndUserData();

  const isTeacher = userData.role === "teacher";

  return (
    <main className="p-4">
      {/* <h1 className="text-3xl font-bold mb-6 text-center text-primary-700">
        Progress Dashboard
      </h1> */}

      {isTeacher ? (
        <TeacherProgressDashboard userId={userData.id} />
      ) : (
        // <div className="max-w-4xl mx-auto">
          <StudentProgressView studentId={userData.id} />
        // </div>
      )}
    </main>
  );
}
