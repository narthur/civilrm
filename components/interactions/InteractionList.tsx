"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { InteractionForm } from "./InteractionForm";

interface InteractionCardProps {
  interaction: Doc<"interactions">;
  onEdit: (interaction: Doc<"interactions">) => void;
}

function InteractionCard({ interaction, onEdit }: InteractionCardProps) {
  const representative = useQuery(
    api.representatives.getRepresentativeDetails,
    {
      id: interaction.representativeId,
    },
  );

  const issue = interaction.issueId
    ? useQuery(api.issues.getIssueDetails, { id: interaction.issueId })
    : null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!representative) {
    return (
      <div className="animate-pulse bg-white shadow rounded-lg p-6 mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
              style={{
                backgroundColor:
                  interaction.outcome === "positive"
                    ? "rgb(220 252 231)"
                    : interaction.outcome === "negative"
                      ? "rgb(254 226 226)"
                      : interaction.outcome === "neutral"
                        ? "rgb(229 231 235)"
                        : "rgb(243 244 246)",
                color:
                  interaction.outcome === "positive"
                    ? "rgb(22 101 52)"
                    : interaction.outcome === "negative"
                      ? "rgb(153 27 27)"
                      : interaction.outcome === "neutral"
                        ? "rgb(31 41 55)"
                        : "rgb(55 65 81)",
              }}
            >
              {interaction.outcome}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {interaction.type}
            </span>
            {interaction.follow_up_needed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Follow-up needed
              </span>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-100 mt-2">
            {representative.name}
          </h3>
          <p className="text-sm text-gray-300">
            {formatDate(interaction.date)}
          </p>
          {issue && (
            <p className="text-sm text-gray-300 mt-1">
              Related to issue: {issue.title}
            </p>
          )}
        </div>
        <button
          onClick={() => onEdit(interaction)}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Edit
        </button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300">Notes</h4>
        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">
          {interaction.notes}
        </p>
      </div>

      {interaction.message_feedback && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-200">
            Message Feedback
          </h4>
          {interaction.message_feedback.original_draft && (
            <div>
              <p className="text-xs text-gray-500">Original Draft</p>
              <p className="text-sm text-gray-300">
                {interaction.message_feedback.original_draft}
              </p>
            </div>
          )}
          {interaction.message_feedback.final_version && (
            <div>
              <p className="text-xs text-gray-500">Final Version</p>
              <p className="text-sm text-gray-300">
                {interaction.message_feedback.final_version}
              </p>
            </div>
          )}
          {interaction.message_feedback.what_worked &&
            interaction.message_feedback.what_worked.length > 0 && (
              <div>
                <p className="text-xs text-gray-500">What Worked</p>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {interaction.message_feedback.what_worked.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export function InteractionList() {
  const [showForm, setShowForm] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<
    Doc<"interactions"> | undefined
  >();
  const [dateRange, setDateRange] = useState<
    { start: number; end: number } | undefined
  >();

  const interactions = useQuery(api.interactions.listMyInteractions, {
    dateRange,
  });

  const handleEdit = (interaction: Doc<"interactions">) => {
    setEditingInteraction(interaction);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingInteraction(undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInteraction(undefined);
  };

  const handleFormSuccess = () => {
    // The query will automatically refresh with the new data
    setShowForm(false);
    setEditingInteraction(undefined);
  };

  const handleDateRangeChange = (range: "all" | "week" | "month" | "year") => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    switch (range) {
      case "week":
        setDateRange({
          start: now - 7 * day,
          end: now,
        });
        break;
      case "month":
        setDateRange({
          start: now - 30 * day,
          end: now,
        });
        break;
      case "year":
        setDateRange({
          start: now - 365 * day,
          end: now,
        });
        break;
      case "all":
        setDateRange(undefined);
        break;
    }
  };

  if (!interactions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label
            htmlFor="date-range"
            className="mr-2 text-sm font-medium text-gray-300"
          >
            Time range:
          </label>
          <select
            id="date-range"
            onChange={(e) =>
              handleDateRangeChange(
                e.target.value as "all" | "week" | "month" | "year",
              )
            }
            className="bg-gray-800 mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All time</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
            <option value="year">Past year</option>
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log Interaction
        </button>
      </div>

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No interactions found. Log your first interaction to get started!
          </p>
        ) : (
          interactions.map((interaction) => (
            <InteractionCard
              key={interaction._id}
              interaction={interaction}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {showForm && (
        <InteractionForm
          interaction={editingInteraction}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
