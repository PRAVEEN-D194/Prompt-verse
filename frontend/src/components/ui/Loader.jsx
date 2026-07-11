import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = ({ size = 24, className }) => {
  return (
    <div className="flex justify-center items-center h-full w-full p-4">
      <Loader2 size={size} className={`animate-spin text-primary ${className || ""}`} />
    </div>
  );
};
