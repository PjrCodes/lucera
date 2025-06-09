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
    weeklyDigest: false,

    // Privacy & Profile
    lighthouseProfileVisibility: "private",
    showOnlineStatus: true,
    showLastSeen: false,
    allowProfileSearch: true,
    showCompletionBadges: true,

    // Study & Learning
    studyMode: "focus", // "focus" | "relaxed" | "hardcore"
    pomodoroEnabled: false,
    pomodoroLength: 25,
    breakLength: 5,
    studyGoalHours: 2,
    difficultyPreference: "adaptive",

    // Integrations
    calendarIntegration: false,
    driveIntegration: false,
    notionIntegration: false,
    slackIntegration: false,

    // Accessibility
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,

    // AI Assistant
    aiAssistantEnabled: true,
    aiHints: true,
    aiAutoCorrect: false,
    aiPersonality: "friendly", // "professional" | "friendly" | "quirky"

    // Dashboard
    dashboardLayout: "grid", // "grid" | "list" | "kanban"
    showUpcomingAssignments: true,
    showProgressCharts: true,
    showRecentActivity: true,
    maxRecentItems: 10,

    // Performance
    autoSaveInterval: 30,
    offlineMode: false,
    dataUsageMode: "normal", // "minimal" | "normal" | "unlimited"
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
            <label className="flex items-center">
              <input
                name="weeklyDigest"
                type="checkbox"
                checked={form.weeklyDigest}
                onChange={handleChange}
                className="mr-2"
              />
              Weekly Progress Digest
            </label>
          </div>
        </div>

        {/* Privacy & Profile */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔒 Privacy & Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">
                Lighthouse Profile Visibility
              </label>
              <select
                name="lighthouseProfileVisibility"
                value={form.lighthouseProfileVisibility}
                onChange={handleSelectChange}
                className="border rounded w-full p-2"
              >
                <option value="public">🌍 Public (everyone)</option>
                <option value="students">🎓 Students in my courses</option>
                <option value="private">🔒 Private (only me & admins)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  name="showOnlineStatus"
                  type="checkbox"
                  checked={form.showOnlineStatus}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show online status
              </label>
              <label className="flex items-center">
                <input
                  name="showLastSeen"
                  type="checkbox"
                  checked={form.showLastSeen}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show last seen
              </label>
              <label className="flex items-center">
                <input
                  name="allowProfileSearch"
                  type="checkbox"
                  checked={form.allowProfileSearch}
                  onChange={handleChange}
                  className="mr-2"
                />
                Allow profile search
              </label>
              <label className="flex items-center">
                <input
                  name="showCompletionBadges"
                  type="checkbox"
                  checked={form.showCompletionBadges}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show completion badges
              </label>
            </div>
          </div>
        </div>

        {/* Study & Learning */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📚 Study & Learning</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Study Mode</label>
                <select
                  name="studyMode"
                  value={form.studyMode}
                  onChange={handleSelectChange}
                  className="border rounded w-full p-2"
                >
                  <option value="focus">🎯 Focus Mode</option>
                  <option value="relaxed">😌 Relaxed Mode</option>
                  <option value="hardcore">💪 Hardcore Mode</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Difficulty Preference
                </label>
                <select
                  name="difficultyPreference"
                  value={form.difficultyPreference}
                  onChange={handleSelectChange}
                  className="border rounded w-full p-2"
                >
                  <option value="adaptive">🤖 Adaptive</option>
                  <option value="easy">😊 Easy</option>
                  <option value="medium">🤔 Medium</option>
                  <option value="hard">🔥 Hard</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  name="pomodoroEnabled"
                  type="checkbox"
                  checked={form.pomodoroEnabled}
                  onChange={handleChange}
                  className="mr-2"
                />
                Enable Pomodoro Timer
              </label>
              <div>
                <label className="block text-sm mb-1">Study Length (min)</label>
                <input
                  name="pomodoroLength"
                  type="number"
                  value={form.pomodoroLength}
                  onChange={handleChange}
                  className="border rounded w-full p-1"
                  min="15"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Break Length (min)</label>
                <input
                  name="breakLength"
                  type="number"
                  value={form.breakLength}
                  onChange={handleChange}
                  className="border rounded w-full p-1"
                  min="5"
                  max="30"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">
                Daily Study Goal (hours)
              </label>
              <input
                name="studyGoalHours"
                type="number"
                value={form.studyGoalHours}
                onChange={handleChange}
                className="border rounded w-32 p-2"
                min="0.5"
                max="12"
                step="0.5"
              />
            </div>
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
                    name="aiHints"
                    type="checkbox"
                    checked={form.aiHints}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Show AI hints
                </label>
                <label className="flex items-center">
                  <input
                    name="aiAutoCorrect"
                    type="checkbox"
                    checked={form.aiAutoCorrect}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  AI auto-correction
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Customization */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Dashboard</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Layout Style</label>
              <select
                name="dashboardLayout"
                value={form.dashboardLayout}
                onChange={handleSelectChange}
                className="border rounded w-full p-2"
              >
                <option value="grid">🔲 Grid View</option>
                <option value="list">📝 List View</option>
                <option value="kanban">📋 Kanban Board</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  name="showUpcomingAssignments"
                  type="checkbox"
                  checked={form.showUpcomingAssignments}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show upcoming assignments
              </label>
              <label className="flex items-center">
                <input
                  name="showProgressCharts"
                  type="checkbox"
                  checked={form.showProgressCharts}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show progress charts
              </label>
              <label className="flex items-center">
                <input
                  name="showRecentActivity"
                  type="checkbox"
                  checked={form.showRecentActivity}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show recent activity
              </label>
              <div>
                <label className="block text-sm mb-1">Max recent items</label>
                <input
                  name="maxRecentItems"
                  type="number"
                  value={form.maxRecentItems}
                  onChange={handleChange}
                  className="border rounded w-full p-1"
                  min="5"
                  max="50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Integrations</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                name="calendarIntegration"
                type="checkbox"
                checked={form.calendarIntegration}
                onChange={handleChange}
                className="mr-2"
              />
              📅 Google Calendar
            </label>
            <label className="flex items-center">
              <input
                name="driveIntegration"
                type="checkbox"
                checked={form.driveIntegration}
                onChange={handleChange}
                className="mr-2"
              />
              💾 Google Drive
            </label>
            <label className="flex items-center">
              <input
                name="notionIntegration"
                type="checkbox"
                checked={form.notionIntegration}
                onChange={handleChange}
                className="mr-2"
              />
              📝 Notion
            </label>
            <label className="flex items-center">
              <input
                name="slackIntegration"
                type="checkbox"
                checked={form.slackIntegration}
                onChange={handleChange}
                className="mr-2"
              />
              💬 Slack
            </label>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">♿ Accessibility</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                name="highContrast"
                type="checkbox"
                checked={form.highContrast}
                onChange={handleChange}
                className="mr-2"
              />
              High contrast mode
            </label>
            <label className="flex items-center">
              <input
                name="largeText"
                type="checkbox"
                checked={form.largeText}
                onChange={handleChange}
                className="mr-2"
              />
              Large text
            </label>
            <label className="flex items-center">
              <input
                name="reducedMotion"
                type="checkbox"
                checked={form.reducedMotion}
                onChange={handleChange}
                className="mr-2"
              />
              Reduced motion
            </label>
            <label className="flex items-center">
              <input
                name="screenReader"
                type="checkbox"
                checked={form.screenReader}
                onChange={handleChange}
                className="mr-2"
              />
              Screen reader optimized
            </label>
            <label className="flex items-center">
              <input
                name="keyboardNavigation"
                type="checkbox"
                checked={form.keyboardNavigation}
                onChange={handleChange}
                className="mr-2"
              />
              Enhanced keyboard navigation
            </label>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Performance</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Data Usage Mode</label>
                <select
                  name="dataUsageMode"
                  value={form.dataUsageMode}
                  onChange={handleSelectChange}
                  className="border rounded w-full p-2"
                >
                  <option value="minimal">🔋 Minimal (save data)</option>
                  <option value="normal">📊 Normal</option>
                  <option value="unlimited">🚀 Unlimited (full quality)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Auto-save interval (seconds)
                </label>
                <input
                  name="autoSaveInterval"
                  type="number"
                  value={form.autoSaveInterval}
                  onChange={handleChange}
                  className="border rounded w-full p-2"
                  min="10"
                  max="300"
                />
              </div>
            </div>
            <label className="flex items-center">
              <input
                name="offlineMode"
                type="checkbox"
                checked={form.offlineMode}
                onChange={handleChange}
                className="mr-2"
              />
              Enable offline mode (beta)
            </label>
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
