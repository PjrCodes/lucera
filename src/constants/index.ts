import { FiClipboard, FiHelpCircle, FiBookOpen, FiCode, FiAward, FiUsers, FiCalendar } from "react-icons/fi";

export const iconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'assignment':
      return FiClipboard;
    case 'quiz':
      return FiHelpCircle;
    case 'exam':
    case 'midsem_exam':
    case 'endsem_exam':
      return FiBookOpen;
    case 'lab':
    case 'lab_exam':
      return FiCode;
    case 'project':
      return FiAward;
    case 'tutorial or workshop':
      return FiUsers;
    default:
      return FiCalendar;
  }
};