import { InteractionList } from "../components/interactions/InteractionList";

export default function InteractionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-200">Interactions</h1>
        <p className="mt-2 text-sm text-gray-300">
          Track and manage your interactions with representatives.
        </p>
      </div>

      <InteractionList />
    </div>
  );
}
