/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import client from "@/lib/db";
import remarkGfm from "remark-gfm";

async function getCourse(course_id: string) {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) });
  return course;
}

export default async function CourseViewPage({
  params,
}: {
  params: { course_id: string };
}) {
  const { course_id } = await params;
  const course = await getCourse(course_id);

  if (!course) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      {course.short_description && (
        <div className="mb-4 text-gray-700 italic">
          {course.short_description}
        </div>
      )}
      <div className="mb-6 prose">
        <Markdown
          components={{
            h1(props) {
              const { node, ...rest } = props;
              return <h1 className="text-2xl font-bold" {...rest} />;
            },
            h2(props) {
              const { node, ...rest } = props;
              return <h2 className="text-xl font-semibold" {...rest} />;
            },
            h3(props) {
              const { node, ...rest } = props;
              return <h3 className="text-lg font-semibold" {...rest} />;
            },
            strong(props) {
              const { node, ...rest } = props;
              return <strong className="font-semibold" {...rest} />;
            },
            em(props) {
              const { node, ...rest } = props;
              return <span className="italic" {...rest}></span>;
            },
          }}
          remarkPlugins={[remarkGfm]}
        >
          {course.description}
        </Markdown>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Units</h2>
        <ul className="list-disc list-inside">
          {course.units?.map(
            (unit: { name: string; description?: string }, idx: number) => (
              <li key={idx}>
                <span className="font-semibold">{unit.name}</span>
                {unit.description && (
                  <div className="text-gray-600 text-sm ml-2">
                    {unit.description}
                  </div>
                )}
              </li>
            )
          )}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Timeline</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Title</th>
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">Due Date</th>
                <th className="border px-2 py-1">Grade Release</th>
                <th className="border px-2 py-1">Inferred</th>
              </tr>
            </thead>
            <tbody>
              {course.timeline?.map(
                (
                  item: {
                    type: string;
                    title: string;
                    start_date: string;
                    due_date: string;
                    grade_release_date: string;
                    start_date_inferred?: boolean;
                    due_date_inferred?: boolean;
                    grade_release_date_inferred?: boolean;
                  },
                  idx: number
                ) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{item.type}</td>
                    <td className="border px-2 py-1">{item.title}</td>
                    <td className="border px-2 py-1">
                      {item.start_date}
                      {item.start_date_inferred && (
                        <span className="text-xs text-gray-400 ml-1">*</span>
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {item.due_date}
                      {item.due_date_inferred && (
                        <span className="text-xs text-gray-400 ml-1">*</span>
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {item.grade_release_date}
                      {item.grade_release_date_inferred && (
                        <span className="text-xs text-gray-400 ml-1">*</span>
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {item.start_date_inferred ||
                      item.due_date_inferred ||
                      item.grade_release_date_inferred
                        ? "Yes"
                        : "No"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          * Date marked with * is inferred.
        </div>
      </div>
    </div>
  );
}
