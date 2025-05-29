"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { IssueForm } from "./IssueForm";

interface IssueCardProps {
  issue: Doc<"issues">;
  onEdit: (issue: Doc<"issues">) => void;
}

function IssueCard({ issue, onEdit }: IssueCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
              style={{
                backgroundColor:
                  issue.status === "active"
                    ? "rgb(220 252 231)"
                    : issue.status === "resolved"
                      ? "rgb(229 231 235)"
                      : issue.status === "blocked"
                        ? "rgb(254 226 226)"
                        : issue.status === "monitoring"
                          ? "rgb(254 249 195)"
                          : issue.status === "archived"
                            ? "rgb(243 244 246)"
                            : "rgb(243 244 246)",
                color:
                  issue.status === "active"
                    ? "rgb(22 101 52)"
                    : issue.status === "resolved"
                      ? "rgb(31 41 55)"
                      : issue.status === "blocked"
                        ? "rgb(153 27 27)"
                        : issue.status === "monitoring"
                          ? "rgb(161 98 7)"
                          : issue.status === "archived"
                            ? "rgb(55 65 81)"
                            : "rgb(55 65 81)",
              }}
            >
              {issue.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {issue.priority}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mt-2">{issue.title}</h3>
          <p className="text-sm text-gray-400">
            Created: {formatDate(issue._creationTime)}
          </p>
          {issue.target_date && (
            <p className="text-sm text-gray-400">
              Target: {formatDate(issue.target_date)}
            </p>
          )}
        </div>
        <button
          onClick={() => onEdit(issue)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Edit
        </button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-100">Description</h4>
        <p className="mt-1 text-sm text-gray-400 whitespace-pre-wrap">
          {issue.description}
        </p>
      </div>

      {issue.key_points && issue.key_points.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-100">Key Points</h4>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-400">
            {issue.key_points.map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {issue.success_criteria && issue.success_criteria.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-100">
            Success Criteria
          </h4>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-400">
            {issue.success_criteria.map((criteria: string, index: number) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}

      {issue.notes && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-100">Notes</h4>
          <p className="mt-1 text-sm text-gray-400 whitespace-pre-wrap">
            {issue.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export function IssueList() {
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Doc<"issues"> | undefined>();
  const [statusFilter, setStatusFilter] = useState<
    "all" | Doc<"issues">["status"]
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const issues = useQuery(api.issues.listMyIssues, {});

  const filteredIssues = issues?.filter(
    (issue) =>
      (statusFilter === "all" || issue.status === statusFilter) &&
      (priorityFilter === "all" || issue.priority === priorityFilter),
  );

  const handleEdit = (issue: Doc<"issues">) => {
    setEditingIssue(issue);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingIssue(undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIssue(undefined);
  };

  const handleFormSuccess = () => {
    // The query will automatically refresh with the new data
    setShowForm(false);
    setEditingIssue(undefined);
  };

  if (!issues) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center text-gray-200">
        <div className="flex space-x-4">
          <div>
            <label
              htmlFor="status-filter"
              className="mr-2 text-sm font-medium text-gray-300"
            >
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="archived">Archived</option>
              <option value="resolved">Resolved</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="priority-filter"
              className="mr-2 text-sm font-medium text-gray-300"
            >
              Priority:
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as typeof priorityFilter)
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Issue
        </button>
      </div>

      <div className="space-y-4">
        {filteredIssues?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No issues found. Add your first issue to get started!
          </p>
        ) : (
          filteredIssues?.map((issue) => (
            <IssueCard key={issue._id} issue={issue} onEdit={handleEdit} />
          ))
        )}
      </div>

      {showForm && (
        <IssueForm
          issue={editingIssue}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
