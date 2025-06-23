"use client";
import React, { useState } from "react";

const dummyEndpoint = "/api/settings"; // Replace with real endpoint later

export default function SettingsPage() {
  const [form, setForm] = useState({
    // Notifications
    dmNotifications: true,
    announcementNotifications: true,
    assignmentNotifications: true,
    gradeNotifications: true,
    deadlineReminders: true,

    // AI Assistant
    aiAssistantEnabled: true,
    aiNudges: true,
    aiPersonality: "friendly", // "professional" | "friendly" | "quirky"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value) || value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    // Simulate POST request
    await new Promise((res) => setTimeout(res, 1000));
    // In real app, use fetch:
    // await fetch(dummyEndpoint, { method: "POST", body: JSON.stringify(form) });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📢 Notifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                name="dmNotifications"
                type="checkbox"
                checked={form.dmNotifications}
                onChange={handleChange}
                className="mr-2"
              />
              Direct Messages
            </label>
            <label className="flex items-center">
              <input
                name="announcementNotifications"
                type="checkbox"
                checked={form.announcementNotifications}
                onChange={handleChange}
                className="mr-2"
              />
              Announcements
            </label>
            <label className="flex items-center">
              <input
                name="assignmentNotifications"
                type="checkbox"
                checked={form.assignmentNotifications}
                onChange={handleChange}
                className="mr-2"
              />
              New Assignments
            </label>
            <label className="flex items-center">
              <input
                name="gradeNotifications"
                type="checkbox"
                checked={form.gradeNotifications}
                onChange={handleChange}
                className="mr-2"
              />
              Grade Updates
            </label>
            <label className="flex items-center">
              <input
                name="deadlineReminders"
                type="checkbox"
                checked={form.deadlineReminders}
                onChange={handleChange}
                className="mr-2"
              />
              Deadline Reminders
            </label>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🤖 AI Assistant</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">AI Personality</label>
                <select
                  name="aiPersonality"
                  value={form.aiPersonality}
                  onChange={handleSelectChange}
                  className="border rounded w-full p-2"
                >
                  <option value="professional">💼 Professional</option>
                  <option value="friendly">😊 Friendly</option>
                  <option value="quirky">🤪 Quirky</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    name="aiAssistantEnabled"
                    type="checkbox"
                    checked={form.aiAssistantEnabled}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Enable AI Assistant
                </label>
                <label className="flex items-center">
                  <input
                    name="aiNudges"
                    type="checkbox"
                    checked={form.aiNudges}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  AI Nudges
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium"
            disabled={loading}
          >
            {loading ? "🔄 Saving..." : "💾 Save All Settings"}
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
            onClick={() => window.location.reload()}
          >
            🔄 Reset to Defaults
          </button>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ All settings saved successfully!
          </div>
        )}
      </form>
    </div>
  );
}