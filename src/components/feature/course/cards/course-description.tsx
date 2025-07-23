import { MyMarkdown } from "@/components/core/markdown";
import { Course } from "@/lib/schemas/database";
import { BookText } from "lucide-react";

interface CourseDescriptionProps {
  course: Course;
}

// Custom table component for markdown
const CustomTable = ({
  children,
  ...props
}: React.HTMLProps<HTMLTableElement>) => (
  <div className="overflow-x-auto my-4">
    <table
      className="min-w-full border-collapse border-primary-100 bg-primary-50 rounded-lg shadow-sm"
      {...props}
    >
      {children}
    </table>
  </div>
);

const CustomThead = ({
  children,
  ...props
}: React.HTMLProps<HTMLTableSectionElement>) => (
  <thead className="bg-primary-100" {...props}>
    {children}
  </thead>
);

const CustomTh = ({
  children,
  ...props
}: React.HTMLProps<HTMLTableCellElement>) => (
  <th
    className="border border-primary-100 px-4 py-3 text-left text-sm font-semibold text-primary-900"
    {...props}
  >
    {children}
  </th>
);

const CustomTd = ({
  children,
  ...props
}: React.HTMLProps<HTMLTableCellElement>) => (
  <td
    className="border border-primary-100 px-4 py-3 text-sm text-primary-700"
    {...props}
  >
    {children}
  </td>
);

const CustomTr = ({
  children,
  ...props
}: React.HTMLProps<HTMLTableRowElement>) => (
  <tr className="hover:bg-gray-50 transition-colors" {...props}>
    {children}
  </tr>
);

const markdownComponents = {
  table: CustomTable,
  thead: CustomThead,
  th: CustomTh,
  td: CustomTd,
  tr: CustomTr,
};

export default function CourseDescription({ course }: CourseDescriptionProps) {
  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <BookText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Course Description
          </h2>
          <p className="text-primary-500">
            Overview and details about this course.
          </p>
        </div>
      </div>
      <div className="prose prose-sm prose-headings:text-primary-900 prose-p:text-primary-700 prose-li:text-primary-700 max-w-none">
        <MyMarkdown components={markdownComponents}>
          {course.description}
        </MyMarkdown>
      </div>
    </div>
  );
}
