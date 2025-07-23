"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Table } from "ka-table";
import { DataType, EditingMode } from "ka-table/enums";
import { Trash2, Trash, Palette } from "lucide-react";
import "./edit-course-table.css";
import { FileDropInput } from "@/components/core/inputs/file-drop-input";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  CourseTimelineItem,
  CourseUnit,
  CourseWithEmbeddedSyllabus,
} from "@/lib/schemas/database";
import { TextBox } from "@/components/core/inputs/text-box";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PrimaryButton } from "@/components/core/buttons/primary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import {
  COURSE_COLOR_PALETTE,
  getContrastColor,
  getRandomCourseColor,
  createCourseColorStyle,
} from "@/lib/utils/course-colors";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete-related states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(course?.name || "");
  const [courseCode, setCourseCode] = useState(course?.courseCode || "");
  const [courseStartDate, setCourseStartDate] = useState<string>(
    course?.courseStartDate
      ? new Date(course.courseStartDate).toISOString().slice(0, 10)
      : ""
  );
  const [courseEndDate, setCourseEndDate] = useState<string>(
    course?.courseEndDate
      ? new Date(course.courseEndDate).toISOString().slice(0, 10)
      : ""
  );
  const [coverImage] = useState<string>(
    course?.coverImage || ""
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [courseColor, setCourseColor] = useState<string>(
    course?.courseColor || ""
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [description, setDescription] = useState(course?.description || "");
  const [units, setUnits] = useState<CourseUnit[]>(course?.units || []);

  // Initialize colors for new courses
  useEffect(() => {
    if (isNew && !courseColor) {
      const randomColor = getRandomCourseColor();
      setCourseColor(randomColor);
    }
  }, [isNew, courseColor]);
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
      startDate: (() => {
        if (!item.startDate) return "";
        if (typeof item.startDate === "string") {
          // If it's already a string, check if it's a valid date and convert to YYYY-MM-DD
          const dateObj = new Date(item.startDate);
          return !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : "";
        }
        if (isDate(item.startDate)) {
          return (item.startDate as Date).toISOString().slice(0, 10);
        }
        return "";
      })(),
      dueDate: (() => {
        if (!item.dueDate) return "";
        if (typeof item.dueDate === "string") {
          const dateObj = new Date(item.dueDate);
          return !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : "";
        }
        if (isDate(item.dueDate)) {
          return (item.dueDate as Date).toISOString().slice(0, 10);
        }
        return "";
      })(),
      gradeReleaseDate: (() => {
        if (!item.gradeReleaseDate) return "";
        if (typeof item.gradeReleaseDate === "string") {
          const dateObj = new Date(item.gradeReleaseDate);
          return !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : "";
        }
        if (isDate(item.gradeReleaseDate)) {
          return (item.gradeReleaseDate as Date).toISOString().slice(0, 10);
        }
        return "";
      })(),
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

    // Validate required fields
    if (!name.trim()) {
      setError("Course name is required");
      setLoading(false);
      return;
    }
    if (!courseCode.trim()) {
      setError("Course code is required");
      setLoading(false);
      return;
    }
    if (!courseStartDate) {
      setError("Course start date is required");
      setLoading(false);
      return;
    }
    if (!courseEndDate) {
      setError("Course end date is required");
      setLoading(false);
      return;
    }
    if (courseStartDate && courseEndDate && new Date(courseStartDate) >= new Date(courseEndDate)) {
      setError("Course end date must be after start date");
      setLoading(false);
      return;
    }
    if (!courseColor) {
      setError("Course color is required");
      setLoading(false);
      return;
    }

    try {
      // Handle cover image upload if a new file is selected
      let finalCoverImageId = coverImage; // Keep existing file ID by default

      if (coverImageFile) {
        // Upload the new cover image file
        const formData = new FormData();
        formData.append('file', coverImageFile);
        formData.append('content_type', 'course_cover');

        const uploadResponse = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          finalCoverImageId = uploadResult.fileId; // Store the file ID for database reference
        } else {
          const errorData = await uploadResponse.json();
          setError(`Failed to upload cover image: ${errorData.error || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      const requestData = {
        _id: isNew ? null : course?._id,
        data: {
          name,
          courseCode,
          shortDescription: course?.shortDescription || "", // Keep existing AI-generated shortDescription
          description,
          units,
          timeline,
          courseStartDate: courseStartDate ? new Date(courseStartDate) : null,
          courseEndDate: courseEndDate ? new Date(courseEndDate) : null,
          coverImage: finalCoverImageId || null,
          courseColor: courseColor || null,
          courseColorStyle: courseColor ? createCourseColorStyle(courseColor) : null,
        },
        syllabusFile: syllabusFileName, // Only for new courses
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

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete/course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course?._id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete course");
        setDeleting(false);
        return;
      }
      setShowDeleteDialog(false);
      // Redirect to courses list
      router.push("/");
    } catch (e) {
      if (!(e instanceof Error)) {
        setDeleteError("Unknown error while deleting course");
        setDeleting(false);
        return;
      }
      if (e.message.includes("NEXT_REDIRECT")) {
        throw e;
      }
      setDeleteError(e.message || "Unknown error");
      setDeleting(false);
    }
  };

  // TODO: change these to be much more user-friendly
  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 mx-auto flex flex-col flex-1">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="font-header text-2xl md:text-5xl font-bold text-primary-600 mb-8">
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
            Course Code *
          </label>
          <TextBox
            value={courseCode}
            onChange={(value) => setCourseCode(value)}
            placeholder="e.g., CS101, MATH201"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-secondary-700 block font-semibold mb-1">
              Course Start Date *
            </label>
            <input
              type="date"
              value={courseStartDate}
              onChange={(e) => setCourseStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-secondary-700 block font-semibold mb-1">
              Course End Date *
            </label>
            <input
              type="date"
              value={courseEndDate}
              onChange={(e) => setCourseEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={courseStartDate}
            />
          </div>
        </div>

        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Course Color *
          </label>
          <div className="space-y-3">
            {/* Color Preview and Input */}
            <div className="flex items-center gap-3">
              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-12 h-10 border border-secondary-300 rounded cursor-pointer flex items-center justify-center transition-all hover:scale-105"
                    style={{ backgroundColor: courseColor }}
                  >
                    <Palette
                      size={16}
                      color={getContrastColor(courseColor)}
                      className="opacity-75 hover:opacity-100"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-3">
                    {/* Preset Colors */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Preset Colors
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {COURSE_COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                              courseColor === color
                                ? 'border-gray-400 ring-2 ring-blue-200'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setCourseColor(color);
                              setShowColorPicker(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Custom Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={courseColor}
                          onChange={(e) => setCourseColor(e.target.value)}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <TextBox
                          value={courseColor}
                          onChange={(value) => setCourseColor(value)}
                          placeholder="#60A5FA"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex-1">
                <TextBox
                  value={courseColor}
                  onChange={(value) => setCourseColor(value)}
                  placeholder="#60A5FA"
                />
              </div>
            </div>

            {/* Color Preview */}
            <div
              className="px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: courseColor,
                color: getContrastColor(courseColor)
              }}
            >
              Course Theme Preview
            </div>
          </div>
          <p className="text-sm text-secondary-600 mt-1">
            Choose a color theme for your course. Light colors work best for accessibility.
          </p>
        </div>

        <div>
          <label className="text-secondary-700 block font-semibold mb-1">
            Cover Image (Optional)
          </label>
          <FileDropInput
            accept="image/*"
            file={coverImageFile}
            onFileChange={setCoverImageFile}
          />
          {coverImageFile && (
            <div className="mt-2">
              <Image
                src={URL.createObjectURL(coverImageFile)}
                alt="Course cover preview"
                width={128}
                height={80}
                className="w-32 h-20 object-cover rounded border"
              />
            </div>
          )}
          {!coverImageFile && coverImage && (
            <div className="mt-2">
              <Image
                src={`/api/files/view/${coverImage}`}
                alt="Current course cover"
                width={128}
                height={80}
                className="w-32 h-20 object-cover rounded border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Current cover image</p>
            </div>
          )}
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
        <div className="flex gap-3 items-center">
          <PrimaryButton type="submit" disabled={loading}>
            Save Changes
          </PrimaryButton>

          {!isNew && course && (
            <SecondaryButton
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-danger-600 hover:bg-danger-100 hover:text-danger-900 border-danger-200 hover:border-danger-300 focus-visible:ring-danger-500 transition"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Course
            </SecondaryButton>
          )}
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      {!isNew && course && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-danger-700">
                Delete Course
              </DialogTitle>
              <DialogDescription className="text-danger-600">
                Are you sure you want to delete this course? This action cannot
                be undone.
                <br />
                Please type <b>DELETE</b> to confirm.
              </DialogDescription>
            </DialogHeader>
            <TextBox
              value={deleteInput}
              onChange={setDeleteInput}
              placeholder="Type DELETE to confirm"
              className="mt-2 border-danger-500 focus:outline-danger-700 focus:border-danger-700"
            />
            {deleteError && (
              <div className="text-danger-600 text-sm mt-2">{deleteError}</div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <SecondaryButton variant="outline" disabled={deleting}>
                  Cancel
                </SecondaryButton>
              </DialogClose>
              <SecondaryButton
                variant="default"
                onClick={handleDelete}
                disabled={deleteInput !== "DELETE" || deleting}
                className="bg-danger-600 border-danger-600 text-white hover:bg-danger-700 hover:border-danger-700 focus-visible:ring-danger-500 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </SecondaryButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}
