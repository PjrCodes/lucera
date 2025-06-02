import React from "react";

export default function SelectRolePage() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
      <form method="POST" action="/api/user/set-role" className="space-y-4">
        <div>
          <label className="inline-flex items-center">
            <input type="radio" name="role" value="student" defaultChecked className="mr-2" />
            Student
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input type="radio" name="role" value="teacher" className="mr-2" />
            Teacher
          </label>
        </div>
        <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-lucerayellow hover:text-black font-semibold transition">
          Continue
        </button>
      </form>
    </div>
  );
}
