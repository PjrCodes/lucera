"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Table } from "ka-table";
import { DataType, EditingMode } from "ka-table/enums";
import { Trash2 } from "lucide-react";
import "./edit-course-table.css";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import {
  CourseTimelineItem,
  CourseUnit,
  CourseWithEmbeddedSyllabus,
} from "@/lib/schemas/database";
import { TextArea } from "@/components/core/inputs/text-area";
import { TextBox } from "@/components/core/inputs/text-box";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PrimaryButton } from "@/components/core/buttons/primary";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Client component
interface EditCourseClientProps {
  course: CourseWithEmbeddedSyllabus | null;
  isNew?: boolean;
  userData?: unknown;
  session?: unknown;
}

export function EditCourseForm({
  course,
  isNew = false,
}: EditCourseClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Form state
  const [name, setName] = useState(course?.name || "");
  // const [courseCode, setCourseCode] = useState(course?.courseCode || "");
  // const [courseStartDate, setCourseStartDate] = useState<Date | null>(
  //   course?.courseStartDate || null
  // );
  // const [courseEndDate, setCourseEndDate] = useState<Date | null>(
  //   course?.courseEndDate || null
  // );
  // const [coverImage, setCoverImage] = useState<string | null>(
  //   course?.coverImage || null
  // );
  // const [status, setStatus] = useState<"draft" | "published">(
  //   course?.status || "draft"
  // );

  const [shortDescription, setShortDescription] = useState(
    course?.shortDescription || "",
  );
  const [description, setDescription] = useState(course?.description || "");
  const [units, setUnits] = useState<CourseUnit[]>(course?.units || []);
  // Normalize timeline date fields to Date objects or null for ka-table date editor compatibility
  // const normalizeDate = (val: string | Date | undefined | null): Date | null => {
  //   if (!val) return null;
  //   if (val instanceof Date && !isNaN(val.getTime())) return val;
  //   if (typeof val === "string") {
  //     const d = new Date(val);
  //     return isNaN(d.getTime()) ? null : d;
  //   }
  //   return null;
  // };
  // Type guard for Date
  function isDate(val: unknown): val is Date {
    return (
      Object.prototype.toString.call(val) === "[object Date]" &&
      !isNaN((val as Date).getTime())
    );
  }
  // Timeline state stores date fields as strings
  const [timeline, setTimeline] = useState<CourseTimelineItem[]>(
    (course?.timeline || []).map((item: Partial<CourseTimelineItem>) => ({
      type: item.type ?? "",
      title: item.title ?? "",
      startDate:
        typeof item.startDate === "string"
          ? item.startDate
          : isDate(item.startDate)
            ? (item.startDate as Date).toISOString().slice(0, 10)
            : "",
      dueDate:
        typeof item.dueDate === "string"
          ? item.dueDate
          : isDate(item.dueDate)
            ? (item.dueDate as Date).toISOString().slice(0, 10)
            : "",
      gradeReleaseDate:
        typeof item.gradeReleaseDate === "string"
          ? item.gradeReleaseDate
          : isDate(item.gradeReleaseDate)
            ? (item.gradeReleaseDate as Date).toISOString().slice(0, 10)
            : "",
    })),
  );
  // Syllabus file state should be File | null, only set by user upload
  const [syllabusFileName, setSyllabusFileName] = useState<File | null>(null);

  // Ka-table editing states
  const [editableCells, setEditableCells] = useState<
    { rowKeyValue: number; columnKey: string }[]
  >([]);
  const [timelineEditableCells, setTimelineEditableCells] = useState<
    { rowKeyValue: number; columnKey: string }[]
  >([]);

  // sortable units and timeline items
  const handleUnitChange = (
    idx: number,
    field: keyof CourseUnit,
    value: string,
  ) => {
    setUnits((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, [field]: value } : u)),
    );
  };
  const handleTimelineChange = (
    idx: number,
    field: keyof CourseTimelineItem,
    value: string | boolean,
  ) => {
    setTimeline((prev: CourseTimelineItem[]) =>
      prev.map((t: CourseTimelineItem, i: number) =>
        i === idx ? { ...t, [field]: value } : t,
      ),
    );
  };

  const reorderUnits = (dragIndex: number, hoverIndex: number) => {
    const draggedUnit = units[dragIndex];
    const newUnits = [...units];
    newUnits.splice(dragIndex, 1);
    newUnits.splice(hoverIndex, 0, draggedUnit);
    setUnits(newUnits);
  };

  const reorderTimeline = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = timeline[dragIndex];
    const newTimeline = [...timeline];
    newTimeline.splice(dragIndex, 1);
    newTimeline.splice(hoverIndex, 0, draggedItem);
    setTimeline(newTimeline);
  };

  const addUnit = () => setUnits([...units, { name: "", description: "" }]);
  const removeUnit = (idx: number) =>
    setUnits(units.filter((_, i) => i !== idx));

  const addTimeline = () =>
    setTimeline((prev: CourseTimelineItem[]) => [
      ...prev,
      {
        type: "",
        title: "",
        startDate: "",
        dueDate: "",
        gradeReleaseDate: "",
      },
    ]);
  const removeTimeline = (idx: number) =>
    setTimeline((prev: CourseTimelineItem[]) =>
      prev.filter((_, i: number) => i !== idx),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        _id: isNew ? null : course?._id,
        data: {
          name,
          shortDescription,
          description,
          units,
          timeline,
        },
      };

      const response = await fetch("/api/courses/save", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          `Failed to save course: ${errorData.error || response.statusText}`,
        );
        setLoading(false);
        return;
      }

      const resp = await response.json();

      // saved changes means we can redirect to the courses page
      console.log("Success!", resp);
      redirect("/");
    } catch (err) {
      console.error("Error saving course:", err);
      // if next_redirect

      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError("Failed to save course. Please try again.");
    }
    setLoading(false);
  };

  // TODO: change these to be much more user-friendly
  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-secondary-800">
        {isNew ? "Create Course" : "Edit Course"}
      </h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Name
          </label>
          <TextBox value={name} onChange={(value) => setName(value)} />
        </div>
        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Short Description
          </label>
          <TextArea
            value={shortDescription}
            onChange={(value) => setShortDescription(value)}
            rows={5}
            maxLength={400}
          />
        </div>
        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Description
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || "")}
              height={300}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={true}
            />
          </div>
        </div>
        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Units
          </label>
          <p className="text-sm text-secondary-600 mb-2">
            Define the course units or modules. Drag rows to reorder. Click any
            cell to edit.
          </p>
          <SecondaryButton
            type="button"
            className="mb-2 px-3 py-1 rounded transition-colors"
            onClick={addUnit}
          >
            + Add Unit
          </SecondaryButton>
          <div className="border border-secondary-700 outline-secondary-700 rounded-lg overflow-hidden shadow-sm bg-white w-full">
            <Table
              data={units.map((unit, index) => ({ ...unit, id: index }))}
              rowKeyField="id"
              columns={[
                {
                  key: "name",
                  title: "Unit Name",
                  dataType: DataType.String,
                  isEditable: true,
                },
                {
                  key: "description",
                  title: "Description",
                  dataType: DataType.String,
                  isEditable: true,
                },
                {
                  key: "actions",
                  title: "Actions",
                  width: 80,
                  isEditable: false,
                },
              ]}
              editableCells={editableCells}
              editingMode={EditingMode.Cell}
              noData={{
                text: "No units added yet. Click 'Add Unit' to create your first unit.",
                hideHeader: true,
              }}
              rowReordering={true}
              childComponents={{
                cellText: {
                  content: (props) => {
                    if (props.column.key === "actions") {
                      return (
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            onClick={() => removeUnit(props.rowData.id)}
                            title="Delete unit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    }

                    // Add placeholder text for empty cells
                    if (!props.value || props.value === "") {
                      return (
                        <span
                          className="text-gray-400 italic cursor-pointer"
                          title="Click to edit"
                        >
                          {props.column.key === "name"
                            ? "Click to add unit name"
                            : "Click to add description"}
                        </span>
                      );
                    }

                    return (
                      <span className="cursor-pointer" title="Click to edit">
                        {props.value}
                      </span>
                    );
                  },
                },
              }}
              dispatch={(action) => {
                if (action.type === "ReorderRows") {
                  const { rowKeyValue, targetRowKeyValue } = action;
                  reorderUnits(rowKeyValue, targetRowKeyValue);
                }
                if (action.type === "UpdateCellValue") {
                  const { rowKeyValue, columnKey, value } = action;
                  handleUnitChange(
                    rowKeyValue,
                    columnKey as keyof CourseUnit,
                    value,
                  );
                }
                if (action.type === "OpenEditor") {
                  const { rowKeyValue, columnKey } = action;
                  setEditableCells([{ rowKeyValue, columnKey }]);
                }
                if (action.type === "CloseEditor") {
                  setEditableCells([]);
                }
              }}
            />
          </div>
        </div>{" "}
        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Timeline
          </label>
          <p className="text-secondary-600 text-sm text-gray-600 mb-2">
            Set up your course timeline with assignments, exams, and deadlines.
            Drag rows to reorder. Click any cell to edit.
          </p>
          <SecondaryButton
            type="button"
            className="mb-2 px-3 py-1 rounded transition-colors"
            onClick={addTimeline}
          >
            + Add Timeline Item
          </SecondaryButton>
          <div className="border border-secondary-700 outline-secondary-700 rounded-lg overflow-hidden shadow-sm bg-white w-full">
            <Table
              data={timeline.map((item: CourseTimelineItem, index: number) => ({
                ...item,
                id: index,
                startDate: item.startDate ? new Date(item.startDate) : null,
                dueDate: item.dueDate ? new Date(item.dueDate) : null,
                gradeReleaseDate: item.gradeReleaseDate
                  ? new Date(item.gradeReleaseDate)
                  : null,
              }))}
              rowKeyField="id"
              columns={[
                {
                  key: "type",
                  title: "Type",
                  dataType: DataType.String,
                  isEditable: true,
                },
                {
                  key: "title",
                  title: "Title",
                  dataType: DataType.String,
                  isEditable: true,
                },
                {
                  key: "startDate",
                  title: "Start Date",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "dueDate",
                  title: "Due Date",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "gradeReleaseDate",
                  title: "Grade Release Reminder",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "actions",
                  title: "Actions",
                  width: 100,
                  isEditable: false,
                },
              ]}
              editableCells={timelineEditableCells}
              editingMode={EditingMode.Cell}
              // height={400}
              noData={{
                text: "No timeline items added yet. Click 'Add Timeline Item' to create your first timeline entry.",
                hideHeader: true,
              }}
              rowReordering={true}
              childComponents={{
                cellText: {
                  content: (props) => {
                    if (props.column.key === "actions") {
                      return (
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            onClick={() => removeTimeline(props.rowData.id)}
                            title="Delete timeline item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    }

                    // Format display for date fields
                    if (
                      props.column.key === "startDate" ||
                      props.column.key === "dueDate" ||
                      props.column.key === "gradeReleaseDate"
                    ) {
                      let displayValue = props.value;
                      if (displayValue instanceof Date) {
                        displayValue = displayValue.toISOString().slice(0, 10);
                      }
                      if (!displayValue || displayValue === "") {
                        return (
                          <span
                            className="text-gray-400 italic cursor-pointer"
                            title="Click to set date"
                          >
                            Click to set date
                          </span>
                        );
                      }
                      return (
                        <span className="cursor-pointer" title="Click to edit">
                          {displayValue}
                        </span>
                      );
                    }

                    // Format display for boolean fields
                    if (props.column.key.includes("_inferred")) {
                      return (
                        <span className="cursor-pointer" title="Click to edit">
                          {props.value ? "Yes" : "No"}
                        </span>
                      );
                    }

                    // Other fields
                    if (!props.value || props.value === "") {
                      const placeholderText =
                        props.column.key === "type"
                          ? "Click to add type (Assignment, Exam, etc.)"
                          : `Click to add ${props.column.title?.toLowerCase()}`;

                      return (
                        <span
                          className="text-gray-400 italic cursor-pointer"
                          title="Click to edit"
                        >
                          {placeholderText}
                        </span>
                      );
                    }

                    return (
                      <span className="cursor-pointer" title="Click to edit">
                        {props.value}
                      </span>
                    );
                  },
                },
              }}
              dispatch={(action) => {
                if (action.type === "ReorderRows") {
                  const { rowKeyValue, targetRowKeyValue } = action;
                  reorderTimeline(rowKeyValue, targetRowKeyValue);
                }
                if (action.type === "UpdateCellValue") {
                  const { rowKeyValue, columnKey, value } = action;
                  handleTimelineChange(
                    rowKeyValue,
                    columnKey as keyof CourseTimelineItem,
                    value,
                  );
                }
                if (action.type === "OpenEditor") {
                  const { rowKeyValue, columnKey } = action;
                  setTimelineEditableCells([{ rowKeyValue, columnKey }]);
                }
                if (action.type === "CloseEditor") {
                  setTimelineEditableCells([]);
                }
              }}
            />
          </div>
        </div>
        {isNew && (
          <div>
            <label className="block mb-2 font-medium">
              Syllabus File (PDF) (Optional)
            </label>
            <FileDropInput
              accept="application/pdf"
              file={syllabusFileName}
              onFileChange={setSyllabusFileName}
            />
            {syllabusFileName && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Selected: {syllabusFileName.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSyllabusFileName(null)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
        <PrimaryButton type="submit" disabled={loading}>
          Save Changes
        </PrimaryButton>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
