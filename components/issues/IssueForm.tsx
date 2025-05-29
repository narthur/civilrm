"use client";

import { useState, useEffect, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface IssueFormProps {
  issue?: Doc<"issues">;
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData = {
  title: "",
  description: "",
  status: "active" as Doc<"issues">["status"],
  priority: "medium" as Doc<"issues">["priority"],
  tags: [] as string[],
  target_date: "", // Store as YYYY-MM-DD string
  notes: "",
  key_points: [] as string[],
  success_criteria: [] as string[],
};

export function IssueForm({ issue, onClose, onSuccess }: IssueFormProps) {
  const createIssue = useMutation(api.issues.createIssue);
  const updateIssue = useMutation(api.issues.updateIssue);

  const [formData, setFormData] = useState(initialFormData);
  const [currentTag, setCurrentTag] = useState("");
  const [currentKeyPoint, setCurrentKeyPoint] = useState("");
  const [currentSuccessCriterion, setCurrentSuccessCriterion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        tags: issue.tags || [],
        target_date: issue.target_date
          ? new Date(issue.target_date).toISOString().split("T")[0]
          : "",
        notes: issue.notes,
        key_points: issue.key_points || [],
        success_criteria: issue.success_criteria || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [issue]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tag management
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Key Point management
  const handleAddKeyPoint = () => {
    if (
      currentKeyPoint.trim() &&
      !formData.key_points.includes(currentKeyPoint.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        key_points: [...prev.key_points, currentKeyPoint.trim()],
      }));
      setCurrentKeyPoint("");
    }
  };
  const handleRemoveKeyPoint = (pointToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      key_points: prev.key_points.filter((point) => point !== pointToRemove),
    }));
  };

  // Success Criterion management
  const handleAddSuccessCriterion = () => {
    if (
      currentSuccessCriterion.trim() &&
      !formData.success_criteria.includes(currentSuccessCriterion.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        success_criteria: [
          ...prev.success_criteria,
          currentSuccessCriterion.trim(),
        ],
      }));
      setCurrentSuccessCriterion("");
    }
  };
  const handleRemoveSuccessCriterion = (criterionToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      success_criteria: prev.success_criteria.filter(
        (criterion) => criterion !== criterionToRemove,
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.title || !formData.description || !formData.notes) {
      setError("Title, Description, and Notes are required.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      tags: formData.tags,
      target_date: formData.target_date
        ? new Date(formData.target_date).getTime()
        : undefined,
      notes: formData.notes,
      key_points:
        formData.key_points.length > 0 ? formData.key_points : undefined,
      success_criteria:
        formData.success_criteria.length > 0
          ? formData.success_criteria
          : undefined,
    };

    try {
      if (issue) {
        await updateIssue({ id: issue._id, ...payload });
      } else {
        await createIssue(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save issue:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {issue ? "Edit Issue" : "Add New Issue"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="archived">Archived</option>
                <option value="resolved">Resolved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label
              htmlFor="target_date"
              className="block text-sm font-medium text-gray-700"
            >
              Target Date (Optional)
            </label>
            <input
              type="date"
              name="target_date"
              id="target_date"
              value={formData.target_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="currentTag"
              className="block text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="currentTag"
                id="currentTag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 space-x-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Key Points */}
          <div>
            <label
              htmlFor="currentKeyPoint"
              className="block text-sm font-medium text-gray-700"
            >
              Key Points (Optional)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="currentKeyPoint"
                id="currentKeyPoint"
                value={currentKeyPoint}
                onChange={(e) => setCurrentKeyPoint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyPoint();
                  }
                }}
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2"
                placeholder="Add a key point"
              />
              <button
                type="button"
                onClick={handleAddKeyPoint}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
              >
                Add
              </button>
            </div>
            {formData.key_points.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                {formData.key_points.map((point, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1"
                  >
                    <span>{point}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyPoint(point)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Success Criteria */}
          <div>
            <label
              htmlFor="currentSuccessCriterion"
              className="block text-sm font-medium text-gray-700"
            >
              Success Criteria (Optional)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="currentSuccessCriterion"
                id="currentSuccessCriterion"
                value={currentSuccessCriterion}
                onChange={(e) => setCurrentSuccessCriterion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSuccessCriterion();
                  }
                }}
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2"
                placeholder="Add a success criterion"
              />
              <button
                type="button"
                onClick={handleAddSuccessCriterion}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
              >
                Add
              </button>
            </div>
            {formData.success_criteria.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                {formData.success_criteria.map((criterion, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1"
                  >
                    <span>{criterion}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSuccessCriterion(criterion)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Heroicon name: mini/x-circle */}
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : issue
                  ? "Update Issue"
                  : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
