import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowRight, MapPin, Search } from "lucide-react";

export const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Beautiful landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow">
            Experience the world like never before with our AI-powered travel management system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/places">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 rounded-full shadow-lg">
                Explore Places <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/planner">
              <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white/20 font-semibold px-8 rounded-full backdrop-blur-sm">
                AI Trip Planner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless, intelligent, and comprehensive travel management experience tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Discovery</h3>
              <p className="text-muted-foreground">Find the perfect destinations based on your preferences and AI recommendations.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seamless Booking</h3>
              <p className="text-muted-foreground">Book hotels and activities instantly with our integrated booking system.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Itinerary</h3>
              <p className="text-muted-foreground">Let our advanced AI generate personalized day-by-day travel itineraries.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
