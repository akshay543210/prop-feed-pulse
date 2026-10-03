import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="market-texture flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="editorial-kicker mb-4">Payout Cases</p><h1 className="mb-4 text-7xl font-extrabold">404</h1>
        <p className="mb-7 text-xl text-muted-foreground">This page could not be found.</p>
        <Button asChild><Link to="/">Return home</Link></Button>
      </div>
    </div>
  );
};

export default NotFound;
