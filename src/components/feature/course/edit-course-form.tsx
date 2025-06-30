"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Table } from "ka-table";
import { DataType, EditingMode } from "ka-table/enums";
import { Trash2 } from "lucide-react";
import "ka-table/style.css";
import "./edit-course-table.css";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

type Unit = { name: string; description?: string };
type TimelineItem = {
  type: string;
  title: string;
  start_date: string;
  due_date: string;
  grade_release_date: string;
  start_date_inferred?: boolean;
  due_date_inferred?: boolean;
  grade_release_date_inferred?: boolean;
};

interface Course {
  _id: string;
  name?: string;
  short_description?: string;
  shortDescription?: string;
  description?: string;
  units?: Unit[];
  timeline?: TimelineItem[];
  syllabusFileName?: string;
}

// Client component
interface EditCourseClientProps {
  course: Course | null;
  isNew?: boolean;
  userData?: unknown;
  session?: unknown;
}

export function EditCourseForm({ course, isNew = false }: EditCourseClientProps) {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Form state
  const [name, setName] = useState(course?.name || "");
  const [shortDescription, setShortDescription] = useState(
    course?.short_description || course?.shortDescription || ""
  );
  const [description, setDescription] = useState(course?.description || "");
  const [units, setUnits] = useState<Unit[]>(course?.units || []);
  const [timeline, setTimeline] = useState<TimelineItem[]>(course?.timeline || []);
  const [existingSyllabusName, setExistingSyllabusName] = useState<string | null>(null);
  const [newSyllabusFile, setNewSyllabusFile] = useState<File | null>(null);

  // Ka-table editing states
  const [editableCells, setEditableCells] = useState<{rowKeyValue: number, columnKey: string}[]>([]);
  const [timelineEditableCells, setTimelineEditableCells] = useState<{rowKeyValue: number, columnKey: string}[]>([]);
  const handleUnitChange = (idx: number, field: keyof Unit, value: string) => {
    setUnits((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, [field]: value } : u))
    );
  };

  const handleTimelineChange = (
    idx: number,
    field: keyof TimelineItem,
    value: string | boolean
  ) => {
    setTimeline((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
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
    setTimeline([
      ...timeline,
      {
        type: "",
        title: "",
        start_date: "",
        due_date: "",
        grade_release_date: "",
        start_date_inferred: false,
        due_date_inferred: false,
        grade_release_date_inferred: false,
      },
    ]);
  const removeTimeline = (idx: number) =>
    setTimeline(timeline.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // const payload = {
    //   name,
    //   short_description: shortDescription,
    //   description,
    //   units,
    //   timeline,
    // };
    setError("Failed to update course");
    setLoading(false);
  };

  useEffect(() => {
    if (isNew) {
      if (searchParams) {
        const hasFile = searchParams.get('hasFile') === 'true';
        const fileName = searchParams.get('fileName');

        if (hasFile && fileName) {
          setExistingSyllabusName(decodeURIComponent(fileName));
        } else {
          setExistingSyllabusName(null);
        }
      }
    } else if (course) {
      if (course.syllabusFileName) {
        setExistingSyllabusName(course.syllabusFileName);
      }
      setName(course.name || "");
      setShortDescription(course.short_description || course.shortDescription || "");
      setDescription(course.description || "");
      setUnits(course.units || []);
      setTimeline(course.timeline || []);
    }
  }, [course, isNew, searchParams]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Create Course" : "Edit Course"}
      </h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            className="w-full border px-2 py-1 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Short Description</label>
          <textarea
            className="w-full border px-2 py-1 rounded"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
            maxLength={400}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Description (Markdown)
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
        </div>          <div>
          <label className="block font-semibold mb-1">Units</label>
          <p className="text-sm text-gray-600 mb-2">
            Define the course units or modules. Drag rows to reorder. Click any cell to edit.
          </p>
          <button
            type="button"
            className="mb-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={addUnit}
          >
            + Add Unit
          </button>
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white" style={{ width: '100%' }}>
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
                  width: 100,
                  isEditable: false,
                }
              ]}
              editableCells={editableCells}
              editingMode={EditingMode.Cell}
              height={Math.max(250, units.length * 50 + 100)}
              noData={{ text: "No units added yet. Click 'Add Unit' to create your first unit." }}
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
                        <span className="text-gray-400 italic cursor-pointer" title="Click to edit">
                          {props.column.key === "name" ? "Click to add unit name" : "Click to add description"}
                        </span>
                      );
                    }

                    return (
                      <span className="cursor-pointer" title="Click to edit">
                        {props.value}
                      </span>
                    );
                  }
                }
              }}
              dispatch={(action) => {
                if (action.type === "ReorderRows") {
                  const { rowKeyValue, targetRowKeyValue } = action;
                  reorderUnits(rowKeyValue, targetRowKeyValue);
                }
                if (action.type === "UpdateCellValue") {
                  const { rowKeyValue, columnKey, value } = action;
                  handleUnitChange(rowKeyValue, columnKey as keyof Unit, value);
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
        </div>        <div>
          <label className="block font-semibold mb-1">Timeline</label>
          <p className="text-sm text-gray-600 mb-2">
            Set up your course timeline with assignments, exams, and deadlines. Drag rows to reorder. Click any cell to edit.
          </p>
          <button
            type="button"
            className="mb-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={addTimeline}
          >
            + Add Timeline Item
          </button>
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white" style={{ width: '100%' }}>
            <Table
              data={timeline.map((item, index) => ({ ...item, id: index }))}
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
                  key: "start_date",
                  title: "Start Date",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "due_date",
                  title: "Due Date",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "grade_release_date",
                  title: "Grade Release",
                  dataType: DataType.Date,
                  isEditable: true,
                },
                {
                  key: "start_date_inferred",
                  title: "Start Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                },
                {
                  key: "due_date_inferred",
                  title: "Due Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                },
                {
                  key: "grade_release_date_inferred",
                  title: "Grade Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                },
                {
                  key: "actions",
                  title: "Actions",
                  width: 100,
                  isEditable: false,
                }
              ]}
              editableCells={timelineEditableCells}
              editingMode={EditingMode.Cell}
              height={Math.max(300, timeline.length * 50 + 100)}
              noData={{ text: "No timeline items added yet. Click 'Add Timeline Item' to create your first timeline entry." }}
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
                    if (props.column.key === "start_date" || props.column.key === "due_date" || props.column.key === "grade_release_date") {
                      if (!props.value || props.value === "") {
                        return (
                          <span className="text-gray-400 italic cursor-pointer" title="Click to set date">
                            Click to set date
                          </span>
                        );
                      }
                      return (
                        <span className="cursor-pointer" title="Click to edit">
                          {props.value}
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
                      const placeholderText = props.column.key === "type"
                        ? "Click to add type (Assignment, Exam, etc.)"
                        : `Click to add ${props.column.title?.toLowerCase()}`;

                      return (
                        <span className="text-gray-400 italic cursor-pointer" title="Click to edit">
                          {placeholderText}
                        </span>
                      );
                    }

                    return (
                      <span className="cursor-pointer" title="Click to edit">
                        {props.value}
                      </span>
                    );
                  }
                }
              }}
              dispatch={(action) => {
                if (action.type === "ReorderRows") {
                  const { rowKeyValue, targetRowKeyValue } = action;
                  reorderTimeline(rowKeyValue, targetRowKeyValue);
                }
                if (action.type === "UpdateCellValue") {
                  const { rowKeyValue, columnKey, value } = action;
                  handleTimelineChange(rowKeyValue, columnKey as keyof TimelineItem, value);
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

        <div>
          <label className="block mb-2 font-medium">Syllabus File (PDF)</label>
          {existingSyllabusName && !newSyllabusFile ? (
            <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Current syllabus: {existingSyllabusName}
              </span>
              <button
                type="button"
                onClick={() => setExistingSyllabusName(null)}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Replace
              </button>
            </div>
          ) : (
            <div>
              <FileDropInput
                accept="application/pdf"
                file={newSyllabusFile}
                onFileChange={setNewSyllabusFile}
                disabled={!!newSyllabusFile}
              />
              {newSyllabusFile && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    New file: {newSyllabusFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewSyllabusFile(null)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
          disabled={loading}
        >
          Save Changes
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
