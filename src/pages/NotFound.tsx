
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h1 className="text-4xl sm:text-6xl font-bold text-navy-800">404</h1>
      <p className="mt-4 text-xl text-gray-600 text-center">Oops! We couldn't find the page you're looking for.</p>
      <p className="mt-2 text-muted-foreground text-center">
        The page you requested does not exist or may have been moved.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;
