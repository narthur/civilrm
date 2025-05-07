import { NextPage } from "next";
import { TaskList } from "../components/tasks/TaskList";

const TasksPage: NextPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tasks</h1>
      <TaskList />
    </div>
  );
};

export default TasksPage;