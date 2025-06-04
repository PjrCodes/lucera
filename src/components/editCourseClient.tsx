"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

// Client component
export function EditCourseClient({ course }: { course: any }) {
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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            className="w-full border px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Short Description</label>
          <textarea
            className="w-full border px-2 py-1"
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
            className="w-full border px-2 py-1 font-mono"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Units</label>
          <button
            type="button"
            className="mb-2 px-2 py-1 bg-blue-100 rounded"
            onClick={addUnit}
          >
            + Add Unit
          </button>
          <ul>
            {units.map((unit, idx) => (
              <li key={idx} className="mb-2 border p-2 rounded">
                <input
                  className="border px-1 py-0.5 mr-2"
                  placeholder="Unit Name"
                  value={unit.name}
                  onChange={(e) =>
                    handleUnitChange(idx, "name", e.target.value)
                  }
                  required
                />
                <input
                  className="border px-1 py-0.5 mr-2 w-2/3"
                  placeholder="Unit Description"
                  value={unit.description || ""}
                  onChange={(e) =>
                    handleUnitChange(idx, "description", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="text-red-600 ml-2"
                  onClick={() => removeUnit(idx)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label className="block font-semibold mb-1">Timeline</label>
          <button
            type="button"
            className="mb-2 px-2 py-1 bg-blue-100 rounded"
            onClick={addTimeline}
          >
            + Add Timeline Item
          </button>
          <ul>
            {timeline.map((item, idx) => (
              <li
                key={idx}
                className="mb-2 border p-2 rounded grid grid-cols-2 gap-2"
              >
                <input
                  className="border px-1 py-0.5"
                  placeholder="Type"
                  value={item.type}
                  onChange={(e) =>
                    handleTimelineChange(idx, "type", e.target.value)
                  }
                  required
                />
                <input
                  className="border px-1 py-0.5"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    handleTimelineChange(idx, "title", e.target.value)
                  }
                  required
                />
                <input
                  className="border px-1 py-0.5"
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={item.start_date}
                  onChange={(e) =>
                    handleTimelineChange(idx, "start_date", e.target.value)
                  }
                  required
                />
                <input
                  className="border px-1 py-0.5"
                  placeholder="Due Date (YYYY-MM-DD)"
                  value={item.due_date}
                  onChange={(e) =>
                    handleTimelineChange(idx, "due_date", e.target.value)
                  }
                  required
                />
                <input
                  className="border px-1 py-0.5"
                  placeholder="Grade Release Date (YYYY-MM-DD)"
                  value={item.grade_release_date}
                  onChange={(e) =>
                    handleTimelineChange(
                      idx,
                      "grade_release_date",
                      e.target.value
                    )
                  }
                  required
                />
                <div className="flex items-center space-x-2">
                  <label className="text-xs">
                    <input
                      type="checkbox"
                      checked={!!item.start_date_inferred}
                      onChange={(e) =>
                        handleTimelineChange(
                          idx,
                          "start_date_inferred",
                          e.target.checked
                        )
                      }
                    />{" "}
                    Start Inferred
                  </label>
                  <label className="text-xs">
                    <input
                      type="checkbox"
                      checked={!!item.due_date_inferred}
                      onChange={(e) =>
                        handleTimelineChange(
                          idx,
                          "due_date_inferred",
                          e.target.checked
                        )
                      }
                    />{" "}
                    Due Inferred
                  </label>
                  <label className="text-xs">
                    <input
                      type="checkbox"
                      checked={!!item.grade_release_date_inferred}
                      onChange={(e) =>
                        handleTimelineChange(
                          idx,
                          "grade_release_date_inferred",
                          e.target.checked
                        )
                      }
                    />{" "}
                    Grade Release Inferred
                  </label>
                </div>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeTimeline(idx)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
          disabled={loading}
        >
          Save
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
