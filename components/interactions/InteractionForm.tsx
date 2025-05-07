import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

interface InteractionFormProps {
  interaction?: Doc<"interactions">;
  onClose: () => void;
  onSuccess: () => void;
}

export function InteractionForm({ interaction, onClose, onSuccess }: InteractionFormProps) {
  const addInteraction = useMutation(api.interactions.logInteraction);
  const updateInteraction = useMutation(api.interactions.updateInteraction);
  const representatives = useQuery(api.representatives.listMyRepresentatives, {});
  const issues = useQuery(api.issues.listMyIssues, {});

  const [formData, setFormData] = useState({
    representativeId: (interaction?.representativeId ?? "") as Id<"representatives"> | "",
    issueId: (interaction?.issueId ?? "") as Id<"issues"> | "",
    type: interaction?.type ?? "call" as Doc<"interactions">["type"],
    date: interaction?.date ?? Date.now(),
    notes: interaction?.notes ?? "",
    outcome: interaction?.outcome ?? "neutral" as Doc<"interactions">["outcome"],
    follow_up_needed: interaction?.follow_up_needed ?? false,
    message_feedback: {
      original_draft: interaction?.message_feedback?.original_draft ?? "",
      final_version: interaction?.message_feedback?.final_version ?? "",
      what_worked: interaction?.message_feedback?.what_worked ?? [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatWorked, setWhatWorked] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const commonPayload = {
        type: formData.type,
        date: formData.date,
        notes: formData.notes,
        outcome: formData.outcome,
        follow_up_needed: formData.follow_up_needed,
        message_feedback: formData.message_feedback,
        issueId: formData.issueId === "" ? undefined : formData.issueId,
      };

      if (interaction) {
        await updateInteraction({
          id: interaction._id,
          ...commonPayload,
        });
      } else {
        if (formData.representativeId === "") {
          setError("Representative is required.");
          setIsSubmitting(false);
          return;
        }
        await addInteraction({
          representativeId: formData.representativeId,
          ...commonPayload,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWhatWorked = () => {
    if (whatWorked.trim()) {
      setFormData({
        ...formData,
        message_feedback: {
          ...formData.message_feedback,
          what_worked: [...(formData.message_feedback.what_worked || []), whatWorked.trim()],
        },
      });
      setWhatWorked("");
    }
  };

  const handleRemoveWhatWorked = (index: number) => {
    setFormData({
      ...formData,
      message_feedback: {
        ...formData.message_feedback,
        what_worked: formData.message_feedback.what_worked.filter((_, i) => i !== index),
      },
    });
  };

  if (!representatives) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {interaction ? "Edit Interaction" : "Log New Interaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="representative" className="block text-sm font-medium text-gray-700">
                Representative
              </label>
              <select
                id="representative"
                value={formData.representativeId}
                onChange={(e) => setFormData({ ...formData, representativeId: e.target.value as Id<"representatives"> | "" })}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a representative</option>
                {representatives.map((rep) => (
                  <option key={rep._id} value={rep._id}>
                    {rep.name} - {rep.title}
                  </option>
                ))}
              </select>
            </div>

            {issues && issues.length > 0 && (
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
                  Related Issue (Optional)
                </label>
                <select
                  id="issue"
                  value={formData.issueId}
                  onChange={(e) => setFormData({ ...formData, issueId: e.target.value as Id<"issues"> | "" })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">None</option>
                  {issues.map((issue) => (
                    <option key={issue._id} value={issue._id}>
                      {issue.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Doc<"interactions">["type"] })}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="letter">Letter</option>
                </select>
              </div>
              <div>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700">
                  Outcome
                </label>
                <select
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value as Doc<"interactions">["outcome"] })}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                  <option value="no_response">No Response</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={new Date(formData.date).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="follow_up_needed"
                checked={formData.follow_up_needed}
                onChange={(e) => setFormData({ ...formData, follow_up_needed: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="follow_up_needed" className="ml-2 block text-sm text-gray-900">
                Follow-up needed
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Message Feedback */}
          {(formData.type === "email" || formData.type === "letter") && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Message Feedback</h3>
              <div>
                <label htmlFor="original_draft" className="block text-sm font-medium text-gray-700">
                  Original Draft
                </label>
                <textarea
                  id="original_draft"
                  value={formData.message_feedback.original_draft}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message_feedback: {
                        ...formData.message_feedback,
                        original_draft: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="final_version" className="block text-sm font-medium text-gray-700">
                  Final Version
                </label>
                <textarea
                  id="final_version"
                  value={formData.message_feedback.final_version}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message_feedback: {
                        ...formData.message_feedback,
                        final_version: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="what_worked" className="block text-sm font-medium text-gray-700">
                  What Worked
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    id="what_worked"
                    value={whatWorked}
                    onChange={(e) => setWhatWorked(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a point that worked well"
                  />
                  <button
                    type="button"
                    onClick={handleAddWhatWorked}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                {formData.message_feedback.what_worked.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {formData.message_feedback.what_worked.map((item, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-gray-700">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatWorked(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-5">
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
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Saving..." : interaction ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}