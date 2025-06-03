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
        // Here you can handle the syllabus files submission logic
        alert(`Syllabus files submitted:\n${Array.from(files).map(f => f.name).join(", ")}`);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f7fa",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    padding: "2.5rem 2rem",
                    width: "100%",
                    maxWidth: 420,
                }}
            >
                <h1
                    style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        marginBottom: "2rem",
                        textAlign: "center",
                        color: "#22223b",
                        letterSpacing: 0.5,
                    }}
                >
                    Create Course
                </h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="syllabus-files"
                            style={{
                                display: "block",
                                marginBottom: 10,
                                fontWeight: 600,
                                color: "#4a4e69",
                                fontSize: "1rem",
                            }}
                        >
                            Syllabus Files (up to 5)
                        </label>
                        <input
                            id="syllabus-files"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "0.5rem",
                                border: "1px solid #c9c9c9",
                                borderRadius: 6,
                                background: "#f8f9fa",
                                fontSize: "1rem",
                                color: "#22223b",
                                marginBottom: 10,
                                cursor: "pointer",
                            }}
                            required
                        />
                        {files && files.length > 0 && (
                            <ul style={{ paddingLeft: 18, margin: 0, color: "#22223b" }}>
                                {Array.from(files).slice(0, 5).map((file, idx) => (
                                    <li key={idx} style={{ fontSize: "0.97rem", marginBottom: 2 }}>
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            background: "#4f8cff",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: "1.08rem",
                            letterSpacing: 0.5,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
                            transition: "background 0.2s",
                        }}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;