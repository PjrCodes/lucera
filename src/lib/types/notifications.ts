// Notification system types

export type NotificationType = 
  | "message"
  | "announcement" 
  | "grade_release"
  | "assignment_release"
  | "reminder_grade_assignment"
  | "reminder_deadline_approaching"
  | "reminder_upload_slides";

export interface BaseNotification {
  type: NotificationType;
  userId: string;
  timestamp: string;
  read?: boolean;
}

export interface MessageNotification extends BaseNotification {
  type: "message";
  senderId: string;
  senderName: string;
  message: string;
  conversationId: string;
}

export interface AnnouncementNotification extends BaseNotification {
  type: "announcement";
  announcementId: string;
  title: string;
  courseName: string;
  courseCode: string;
  createdBy: string;
}

export interface GradeReleaseNotification extends BaseNotification {
  type: "grade_release";
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  grade: number;
}

export interface AssignmentReleaseNotification extends BaseNotification {
  type: "assignment_release";
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
}

export interface ReminderNotification extends BaseNotification {
  type: "reminder_grade_assignment" | "reminder_deadline_approaching" | "reminder_upload_slides";
  title: string;
  description: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

export type Notification = 
  | MessageNotification 
  | AnnouncementNotification 
  | GradeReleaseNotification 
  | AssignmentReleaseNotification 
  | ReminderNotification;

export interface NotificationStreamData {
  notification: Notification;
  unreadCount: number;
}
