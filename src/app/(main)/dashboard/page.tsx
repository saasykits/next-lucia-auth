import { NewTaskDialog } from "./new-task";
import { Tasks } from "./tasks";

function DashboardPage() {
  return (
    <div className="container mx-auto min-h-screen p-2">
      <div className="flex items-center py-4">
        <h1 className="w-full text-3xl font-bold">Your Tasks</h1>
        <NewTaskDialog />
      </div>
      <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
        <Tasks />
      </div>
    </div>
  );
}

export default DashboardPage;
