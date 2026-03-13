import { Card } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 p-8 text-center bg-black/40">
        <div className="flex mb-4 gap-2 justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
      </Card>
    </div>
  );
}
