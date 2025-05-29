import { IssueList } from "../../components/issues/IssueList";

export default function IssuesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Issues</h1>
        <p className="mt-2 text-sm text-gray-300">
          Track and manage your advocacy issues and campaigns.
        </p>
      </div>

      <IssueList />
    </div>
  );
}
