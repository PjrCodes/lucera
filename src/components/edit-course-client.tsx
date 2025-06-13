"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "ka-table";
import { DataType, EditingMode } from "ka-table/enums";
import { Trash2, Edit3 } from "lucide-react";
import "ka-table/style.css";

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
}

// Client component
export function EditCourseClient({ course }: { course: Course }) {
  const router = useRouter();
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

  // Editing state
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<number | null>(null);
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
    const payload = {
      name,
      short_description: shortDescription,
      description,
      units,
      timeline,
    };
    const res = await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push(`/courses/view/${course._id}`);
    } else {
      setError("Failed to update course");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <textarea
            className="w-full border px-2 py-1 font-mono rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
          />
        </div>          <div>
          <label className="block font-semibold mb-1">Units</label>
          <p className="text-sm text-gray-600 mb-2">
            Define the course units or modules. Drag rows to reorder. Click the edit icon to modify cells.
          </p>
          <button
            type="button"
            className="mb-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={addUnit}
          >
            + Add Unit
          </button>
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <Table
              data={units.map((unit, index) => ({ ...unit, id: index }))}
              rowKeyField="id"
              columns={[                {
                  key: "name",
                  title: "Unit Name",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 300,
                },
                {
                  key: "description",
                  title: "Description",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 400,
                },
                {
                  key: "actions",
                  title: "Actions",
                  width: 150,
                  isEditable: false,
                }
              ]}              editingMode={EditingMode.Cell}
              height={Math.max(250, units.length * 50 + 100)}
              noData={{ text: "No units added yet. Click 'Add Unit' to create your first unit." }}
              rowReordering={true}              childComponents={{
                cellText: {
                  content: (props) => {
                    if (props.column.key === "actions") {
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              if (editingUnit === props.rowData.id) {
                                setEditingUnit(null);
                              } else {
                                setEditingUnit(props.rowData.id);
                              }
                            }}
                            title="Edit row"
                          >
                            <Edit3 size={16} />
                          </button>
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

                    // Only allow editing if this row is in edit mode
                    if (editingUnit !== props.rowData.id) {
                      return (
                        <span className="text-gray-700">
                          {props.value || <span className="text-gray-400 italic">Click edit to add content</span>}
                        </span>
                      );
                    }

                    return undefined;
                  }
                },
                cellEditor: {
                  content: (props) => {
                    // Only show editor if this row is in edit mode
                    if (editingUnit === props.rowData.id &&
                        (props.column.key === "name" || props.column.key === "description")) {
                      return (
                        <input
                          type="text"
                          value={props.value || ""}
                          onChange={(e) => {
                            props.dispatch({
                              type: "UpdateCellValue",
                              rowKeyValue: props.rowKeyValue,
                              columnKey: props.column.key,
                              value: e.target.value,
                            });
                          }}
                          onBlur={() => setEditingUnit(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") {
                              setEditingUnit(null);
                            }
                          }}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder={props.column.key === "name" ? "Unit name" : "Unit description"}
                          autoFocus
                        />
                      );
                    }
                    return undefined;
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
                if (action.type === "CloseEditor") {
                  setEditingUnit(null);
                }
              }}
            />
          </div>
        </div>        <div>
          <label className="block font-semibold mb-1">Timeline</label>
          <p className="text-sm text-gray-600 mb-2">
            Set up your course timeline with assignments, exams, and deadlines. Drag rows to reorder. Click edit icon to modify cells.
          </p>
          <button
            type="button"
            className="mb-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={addTimeline}
          >
            + Add Timeline Item
          </button>
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <Table
              data={timeline.map((item, index) => ({ ...item, id: index }))}
              rowKeyField="id"
              columns={[                {
                  key: "type",
                  title: "Type",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 120,
                },
                {
                  key: "title",
                  title: "Title",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 200,
                },
                {
                  key: "start_date",
                  title: "Start Date",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 130,
                },
                {
                  key: "due_date",
                  title: "Due Date",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 130,
                },
                {
                  key: "grade_release_date",
                  title: "Grade Release",
                  dataType: DataType.String,
                  isEditable: true,
                  width: 130,
                },
                {
                  key: "start_date_inferred",
                  title: "Start Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                  width: 100,
                },
                {
                  key: "due_date_inferred",
                  title: "Due Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                  width: 100,
                },
                {
                  key: "grade_release_date_inferred",
                  title: "Grade Inferred",
                  dataType: DataType.Boolean,
                  isEditable: true,
                  width: 100,
                },
                {
                  key: "actions",
                  title: "Actions",
                  width: 150,
                  isEditable: false,
                }
              ]}              editingMode={EditingMode.Cell}
              height={Math.max(300, timeline.length * 50 + 100)}
              noData={{ text: "No timeline items added yet. Click 'Add Timeline Item' to create your first timeline entry." }}
              rowReordering={true}
              childComponents={{
                cellText: {
                  content: (props) => {
                    if (props.column.key === "actions") {
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              if (editingTimeline === props.rowData.id) {
                                setEditingTimeline(null);
                              } else {
                                setEditingTimeline(props.rowData.id);
                              }
                            }}
                            title="Edit row"
                          >
                            <Edit3 size={16} />
                          </button>
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

                    // Show read-only content when not editing
                    if (editingTimeline !== props.rowData.id) {
                      // Add placeholders for date fields
                      if (props.column.key === "start_date" || props.column.key === "due_date" || props.column.key === "grade_release_date") {
                        if (!props.value || props.value === "") {
                          return <span className="text-gray-400">YYYY-MM-DD</span>;
                        }
                      }
                      return (
                        <span className="text-gray-700">
                          {props.value || <span className="text-gray-400 italic">Click edit to add content</span>}
                        </span>
                      );
                    }

                    return undefined;
                  }
                },
                cellEditor: {
                  content: (props) => {
                    // Only show editor when this row is being edited
                    if (editingTimeline === props.rowData.id) {
                      // Custom editor for date fields
                      if (props.column.key === "start_date" || props.column.key === "due_date" || props.column.key === "grade_release_date") {
                        return (
                          <input
                            type="date"
                            value={props.value || ""}
                            onChange={(e) => {
                              props.dispatch({
                                type: "UpdateCellValue",
                                rowKeyValue: props.rowKeyValue,
                                columnKey: props.column.key,
                                value: e.target.value,
                              });
                            }}
                            onBlur={() => setEditingTimeline(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setEditingTimeline(null);
                              }
                            }}
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        );
                      }

                      // Custom editor for boolean fields
                      if (props.column.key.includes("_inferred")) {
                        return (
                          <select
                            value={props.value ? "true" : "false"}
                            onChange={(e) => {
                              props.dispatch({
                                type: "UpdateCellValue",
                                rowKeyValue: props.rowKeyValue,
                                columnKey: props.column.key,
                                value: e.target.value === "true",
                              });
                            }}
                            onBlur={() => setEditingTimeline(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setEditingTimeline(null);
                              }
                            }}
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                            autoFocus
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        );
                      }

                      // Default text input for other fields
                      return (
                        <input
                          type="text"
                          value={props.value || ""}
                          onChange={(e) => {
                            props.dispatch({
                              type: "UpdateCellValue",
                              rowKeyValue: props.rowKeyValue,
                              columnKey: props.column.key,
                              value: e.target.value,
                            });
                          }}
                          onBlur={() => setEditingTimeline(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") {
                              setEditingTimeline(null);
                            }
                          }}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                          placeholder={props.column.key === "type" ? "Assignment, Exam, etc." : "Enter " + props.column.title}
                          autoFocus
                        />
                      );
                    }
                    return undefined;
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
              }}
            />
          </div>
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
