import { MyMarkdown } from "@/components/core/markdown";
import { Course } from "@/lib/schemas/database";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-wrap max-w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 text-wrap">
        Course Description
      </h2>
      <div className="prose prose-sm prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <MyMarkdown components={markdownComponents}>
          {course.description}
        </MyMarkdown>
      </div>
    </div>
  );
}
