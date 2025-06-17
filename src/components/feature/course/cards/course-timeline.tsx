import { Course } from "@/app/courses/view/[course_id]/page";
import { iconForType } from "@/constants";

interface CourseTimelineProps {
  course: Course;
}

// Map event types to colors
const getEventColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'quiz':
      return 'bg-lucerablue-1 text-lucerablue-5 border-lucerablue-3';
    case 'assignment':
      return 'bg-luceragreen-1 text-luceragreen-5 border-luceragreen-3';
    case 'midsem_exam':
    case 'endsem_exam':
    case 'exam':
      return 'bg-lucerared-1 text-lucerared-5 border-lucerared-3';
    case 'lab_exam':
      return 'bg-lucerayellow-1 text-lucerayellow-5 border-lucerayellow-3';
    case 'project':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getIconColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'quiz':
      return 'border-lucerablue-3 text-lucerablue-4';
    case 'assignment':
      return 'border-luceragreen-3 text-luceragreen-4';
    case 'midsem_exam':
    case 'endsem_exam':
    case 'exam':
      return 'border-lucerared-3 text-lucerared-4';
    case 'lab_exam':
      return 'border-lucerayellow-3 text-lucerayellow-4';
    case 'project':
      return 'border-purple-300 text-purple-500';
    default:
      return 'border-gray-300 text-gray-500';
  }
};

// Helper to format partial dates
function formatPartialDate(dateStr: string) {
  if (!dateStr) return 'TBD';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  const weekMatch = dateStr.match(/^(\d{4})-(\d{2}) WEEK (\d)$/);
  if (weekMatch) {
    const [_, year, month, week] = weekMatch;
    const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' });
    return `Week ${week} of ${monthName} ${year}`;
  }
  const monthMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const [_, year, month] = monthMatch;
    const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' });
    return `${monthName} ${year}`;
  }
  return dateStr;
}

export default function CourseTimeline({ course }: CourseTimelineProps) {
  if (!course.timeline || course.timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>No timeline events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h2>
      <div className="space-y-4">
        {course.timeline.map((item, idx) => {
          const IconComponent = iconForType(item.type);
          const colorClass = getEventColor(item.type);
          const iconColorClass = getIconColor(item.type);

          return (
            <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 ${iconColorClass} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                      {item.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 Start: {formatPartialDate(item.start_date)}</span>
                    <span>⏰ Due: {formatPartialDate(item.due_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
