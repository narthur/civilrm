"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface RepresentativeFormProps {
  representative?: Doc<"representatives">;
  onClose: () => void;
  onSuccess: () => void;
}

export function RepresentativeForm({
  representative,
  onClose,
  onSuccess,
}: RepresentativeFormProps) {
  const addRepresentative = useMutation(api.representatives.addRepresentative);
  const updateRepresentative = useMutation(
    api.representatives.updateRepresentative,
  );

  const [formData, setFormData] = useState({
    name: representative?.name ?? "",
    title: representative?.title ?? "",
    office: representative?.office ?? "",
    level: representative?.level ?? "federal",
    district: representative?.district ?? "",
    contactInfo: {
      email: representative?.contactInfo.email ?? "",
      phone: representative?.contactInfo.phone ?? "",
      office_address: representative?.contactInfo.office_address ?? "",
    },
    notes: representative?.notes ?? "",
    communication_preferences: {
      preferred_style:
        representative?.communication_preferences?.preferred_style ?? "formal",
      key_interests:
        representative?.communication_preferences?.key_interests ?? [],
      best_practices:
        representative?.communication_preferences?.best_practices ?? [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (representative) {
        await updateRepresentative({
          id: representative._id,
          ...formData,
        });
      } else {
        await addRepresentative(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200">
            {representative ? "Edit Representative" : "Add New Representative"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="office"
                className="block text-sm font-medium text-gray-300"
              >
                Office
              </label>
              <input
                type="text"
                id="office"
                value={formData.office}
                onChange={(e) =>
                  setFormData({ ...formData, office: e.target.value })
                }
                required
                className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-300"
                >
                  Level
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as "federal" | "state" | "local",
                    })
                  }
                  required
                  className="bg-gray-800 mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="federal">Federal</option>
                  <option value="state">State</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-300"
                >
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.contactInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="office_address"
                className="block text-sm font-medium text-gray-300"
              >
                Office Address
              </label>
              <textarea
                id="office_address"
                value={formData.contactInfo.office_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInfo: {
                      ...formData.contactInfo,
                      office_address: e.target.value,
                    },
                  })
                }
                rows={2}
                className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="text-gray-200 mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">
              Communication Preferences
            </h3>
            <div>
              <label
                htmlFor="preferred_style"
                className="block text-sm font-medium text-gray-300"
              >
                Preferred Style
              </label>
              <select
                id="preferred_style"
                value={formData.communication_preferences.preferred_style}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    communication_preferences: {
                      ...formData.communication_preferences,
                      preferred_style: e.target.value as "formal" | "casual",
                    },
                  })
                }
                className="bg-gray-800 mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting
                ? "Saving..."
                : representative
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
