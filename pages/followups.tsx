import { NextPage } from "next";
import { FollowupList } from "../components/followups/FollowupList";

const FollowupsPage: NextPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-200 mb-6">Follow-ups</h1>
      <FollowupList />
    </div>
  );
};

export default FollowupsPage;
