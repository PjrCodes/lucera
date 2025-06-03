"use client"; 

import React, { useState } from "react";

const CreateCoursePage: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            alert("Please upload at least one syllabus file.");
            return;
        }
        alert(`Syllabus files submitted:\n${Array.from(files).map(f => f.name).join(", ")}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-xl shadow-lg px-8 py-10 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">
                    Create Course
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label
                            htmlFor="syllabus-files"
                            className="block mb-2 font-semibold text-gray-700 text-base"
                        >
                            Syllabus Files (up to 5)
                        </label>
                        <input
                            id="syllabus-files"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer mb-2"
                            required
                        />
                        {files && files.length > 0 && (
                            <ul className="pl-5 text-gray-700 text-sm">
                                {Array.from(files).slice(0, 5).map((file, idx) => (
                                    <li key={idx} className="mb-1">{file.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-md shadow transition-colors"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;