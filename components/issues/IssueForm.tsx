import { Doc } from "../../convex/_generated/dataModel";

interface IssueFormProps {
  issue?: Doc<"issues">;
  onClose: () => void;
  onSuccess: () => void;
}

export function IssueForm({ issue, onClose, onSuccess }: IssueFormProps) {
  // Placeholder implementation
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {issue ? "Edit Issue" : "Add New Issue"}
        </h2>
        <p>Issue form placeholder</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            {issue ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}