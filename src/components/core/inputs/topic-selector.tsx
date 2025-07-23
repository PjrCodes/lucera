"use client";
import React, { useState, useMemo } from "react";
import { Checkbox } from "@/components/core/inputs/checkbox";
import { TextBox } from "@/components/core/inputs/text-box";
import { Search } from "lucide-react";

interface TopicSelectorProps {
  topics: string[];
  selectedTopics: number[];
  onTopicChange: (index: number) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function TopicSelector({
  topics,
  selectedTopics,
  onTopicChange,
  label = "Topics",
  required = false,
  placeholder = "Search topics...",
}: TopicSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter topics based on search term
  const filteredTopicsWithIndices = useMemo(() => {
    if (!searchTerm.trim()) {
      return topics.map((topic, index) => ({ topic, index }));
    }

    return topics
      .map((topic, index) => ({ topic, index }))
      .filter(item => item.topic.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topics, searchTerm]);

  const selectedCount = selectedTopics.length;
  const totalCount = topics.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500">
            {selectedCount} of {totalCount} selected
          </span>
        )}
      </div>

      {topics.length > 6 && (
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <TextBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
      )}

      {filteredTopicsWithIndices.length === 0 && searchTerm ? (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No topics found matching &ldquo;{searchTerm}&rdquo;</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary-600 hover:text-primary-700 text-sm mt-1"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
          {filteredTopicsWithIndices.map(({ topic, index }) => (
            <label
              key={index}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-25 transition-colors cursor-pointer group"
            >
              <Checkbox
                checked={selectedTopics.includes(index)}
                onCheckedChange={() => onTopicChange(index)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 leading-relaxed">
                {topic}
              </span>
            </label>
          ))}
        </div>
      )}

      {topics.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
          <p>No topics available for this course.</p>
          <p className="text-xs mt-1">Topics are generated from course units.</p>
        </div>
      )}
    </div>
  );
}
