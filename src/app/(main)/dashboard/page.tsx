import { NewTaskDialog } from "./new-task";
import { Tasks } from "./tasks";

function DashboardPage() {
  return (
    <div className="container mx-auto min-h-[calc(100vh-100px)] p-2">
      <div className="flex items-center py-4">
        <h1 className="w-full text-3xl font-bold">Your Tasks</h1>
        <NewTaskDialog />
      </div>
      <div className="h-10"></div>
      <Tasks />
    </div>
  );
}

export default DashboardPage;
