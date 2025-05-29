import { RepresentativeList } from "../../components/representatives/RepresentativeList";

export default function RepresentativesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-200">Representatives</h1>
        <p className="mt-2 text-sm text-gray-200">
          Manage your list of representatives and their contact information.
        </p>
      </div>

      <RepresentativeList />
    </div>
  );
}
