import React from "react";

interface Option {
  id: number;
  type: string;
  label: string;
}

interface Props {
  options: Option[];
}

const Create: React.FC<Props> = ({ options }) => (
  <div className="bg-pink-50 rounded shadow p-4 min-h-[220px]">
    <h2 className="font-bold mb-2 text-pink-900">Create</h2>
    <ul>
      {options.map((opt) => (
        <li key={opt.id} className="mb-1">
          <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">
            {opt.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default Create;
