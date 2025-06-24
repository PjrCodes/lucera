"use client";
import React, { useState } from "react";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { SecondaryButton } from "@/components/core/buttons/secondary";

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
          <h2 className="text-xl font-semibold mb-6">📢 Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              name="dmNotifications"
              checked={form.dmNotifications}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, dmNotifications: checked }))}
            >
              Direct Messages
            </Checkbox>
            <Checkbox
              name="announcementNotifications"
              checked={form.announcementNotifications}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, announcementNotifications: checked }))}
            >
              Announcements
            </Checkbox>
            <Checkbox
              name="assignmentNotifications"
              checked={form.assignmentNotifications}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, assignmentNotifications: checked }))}
            >
              New Assignments
            </Checkbox>
            <Checkbox
              name="gradeNotifications"
              checked={form.gradeNotifications}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, gradeNotifications: checked }))}
            >
              Grade Updates
            </Checkbox>
            <Checkbox
              name="deadlineReminders"
              checked={form.deadlineReminders}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, deadlineReminders: checked }))}
              className="md:col-span-2"
            >
              Deadline Reminders
            </Checkbox>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Assistant</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                name="aiPersonality"
                value={form.aiPersonality}
                onChange={(value) => setForm(prev => ({ ...prev, aiPersonality: value }))}
                options={[
                  { value: "professional", label: "💼 Professional" },
                  { value: "friendly", label: "😊 Friendly" },
                  { value: "quirky", label: "🤪 Quirky" },
                ]}
                placeholder="Select AI Personality"
              >
                AI Personality
              </Dropdown>
              <div className="space-y-4">
                <Checkbox
                  name="aiAssistantEnabled"
                  checked={form.aiAssistantEnabled}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, aiAssistantEnabled: checked }))}
                >
                  Enable AI Assistant
                </Checkbox>
                <Checkbox
                  name="aiNudges"
                  checked={form.aiNudges}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, aiNudges: checked }))}
                >
                  AI Nudges
                </Checkbox>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <SecondaryButton
            type="submit"
            disabled={loading}
            className="px-6 py-3"
          >
            {loading ? "🔄 Saving..." : "💾 Save All Settings"}
          </SecondaryButton>
          <SecondaryButton
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="px-6 py-3"
          >
            🔄 Reset to Defaults
          </SecondaryButton>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="font-medium">All settings saved successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
