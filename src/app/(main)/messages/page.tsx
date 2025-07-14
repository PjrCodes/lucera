import MessagesClientComponent from "@/components/feature/messages/messages-client-component";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCoursesForUser, getCoursesOwnedByTeacher } from "@/lib/database-service/courses";
import { ObjectId } from "mongodb";
import React from "react";

export default async function MessagesPage() {
  const { session, userData } = await getSessionAndUserData();

  // Get the appropriate courses based on user role
  let courses;
  if (userData.role === "teacher") {
    // Teachers can create announcements for courses they own
    courses = await getCoursesOwnedByTeacher(session.user.id);
  } else {
    // Students see announcements from courses they're enrolled in
    courses = await getCoursesForUser(session.user.id);
  }

  courses.forEach((course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  return <MessagesClientComponent session={session} userData={userData} courses={courses} />;
}
