import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { RepresentativeForm } from "./RepresentativeForm";

interface RepresentativeCardProps {
  representative: Doc<"representatives">;
  onEdit: (representative: Doc<"representatives">) => void;
}

function RepresentativeCard({
  representative,
  onEdit,
}: RepresentativeCardProps) {
  return (
    <div className="bg-gray-700 shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-100">
            {representative.name}
          </h3>
          <p className="text-sm text-gray-200">{representative.title}</p>
          <p className="text-sm text-gray-200">{representative.office}</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {representative.level}
            </span>
            {representative.district && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                District: {representative.district}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onEdit(representative)}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Edit
        </button>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-100">
          Contact Information
        </h4>
        <div className="mt-2 text-sm text-gray-200">
          {representative.contactInfo.email && (
            <p>Email: {representative.contactInfo.email}</p>
          )}
          {representative.contactInfo.phone && (
            <p>Phone: {representative.contactInfo.phone}</p>
          )}
          {representative.contactInfo.office_address && (
            <p>Office: {representative.contactInfo.office_address}</p>
          )}
        </div>
      </div>
      {representative.notes && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-100">Notes</h4>
          <p className="mt-1 text-sm text-gray-200">{representative.notes}</p>
        </div>
      )}
    </div>
  );
}

export function RepresentativeList() {
  const representatives = useQuery(
    api.representatives.listMyRepresentatives,
    {},
  );
  const [levelFilter, setLevelFilter] = useState<
    "all" | "federal" | "state" | "local"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<
    Doc<"representatives"> | undefined
  >();

  const filteredRepresentatives = representatives?.filter(
    (rep) => levelFilter === "all" || rep.level === levelFilter,
  );

  const handleEdit = (representative: Doc<"representatives">) => {
    setEditingRepresentative(representative);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingRepresentative(undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRepresentative(undefined);
  };

  const handleFormSuccess = () => {
    // The query will automatically refresh with the new data
    setShowForm(false);
    setEditingRepresentative(undefined);
  };

  if (!representatives) {
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
            htmlFor="level-filter"
            className="mr-2 text-sm font-medium text-gray-200"
          >
            Filter by level:
          </label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) =>
              setLevelFilter(e.target.value as typeof levelFilter)
            }
            className="text-gray-200 bg-gray-800 mt-1 block w-full pl-3 pr-10 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-800 sm:text-sm rounded-md"
          >
            <option value="all">All Levels</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="local">Local</option>
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Representative
        </button>
      </div>

      <div className="space-y-4">
        {filteredRepresentatives?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No representatives found. Add your first representative to get
            started!
          </p>
        ) : (
          filteredRepresentatives?.map((representative) => (
            <RepresentativeCard
              key={representative._id}
              representative={representative}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {showForm && (
        <RepresentativeForm
          representative={editingRepresentative}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
