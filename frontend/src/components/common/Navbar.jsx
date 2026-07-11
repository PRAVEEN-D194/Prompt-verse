import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Map, Menu, X, User } from "lucide-react";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Places", path: "/places" },
    { name: "Hotels", path: "/hotels" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Map className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary hidden sm:inline-block">AI Smart Tourism</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-sm font-medium transition-colors hover:text-primary">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                <User className="h-5 w-5" />
                <span>{user.name}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t flex flex-col space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" className="block text-sm font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Button variant="outline" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full justify-center">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full justify-center">Login</Button></Link>
                <Link to="/register" onClick={() => setIsOpen(false)}><Button className="w-full justify-center">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
