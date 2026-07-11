import React from "react";
import { Link } from "react-router-dom";
import { Map } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <Map className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">AI Smart Tourism</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Explore the world with our AI-powered travel assistant. Discover, plan, and book your perfect trip.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/places" className="hover:text-primary">Destinations</Link></li>
            <li><Link to="/hotels" className="hover:text-primary">Hotels</Link></li>
            <li><Link to="/planner" className="hover:text-primary">AI Planner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Smart Tourism Management System. All rights reserved.
      </div>
    </footer>
  );
};
