import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DashboardPage() {
  return (
    <div className="container mx-auto p-2">
      <div className="flex">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
