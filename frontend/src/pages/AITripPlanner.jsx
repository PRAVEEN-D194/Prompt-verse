import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Sparkles, MapPin, Calendar, Users } from "lucide-react";
import { itineraryService } from "../services/itineraryService";
import { aiService } from "../services/aiService";

export const AITripPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    travelers: "",
    interests: ""
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call real backend Gemini AI service
      const response = await aiService.generateItinerary(formData);
      
      if (response.success) {
        setResult(response.itinerary);

        // Save to backend using existing itinerary saving API
        try {
          await itineraryService.createItinerary({
            title: `Trip to ${formData.destination}`,
            destination: formData.destination,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + parseInt(formData.duration) * 86400000).toISOString(),
            activities: [
              { day: 1, description: "Arrival and check-in" },
              { day: 2, description: response.itinerary }
            ]
          });
        } catch (saveError) {
          console.error("Error saving itinerary:", saveError);
        }
      } else {
        setError(response.message || "Failed to generate itinerary.");
      }
    } catch (err) {
      console.error("API error:", err);
      setError(err.response?.data?.message || "An error occurred while communicating with the AI service.");
    } finally {
      setLoading(false);
    }
  };



  console.log(result);
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 text-purple-600 rounded-full mb-4">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Trip Planner</h1>
          <p className="text-xl text-muted-foreground">Let our advanced AI design your perfect itinerary in seconds.</p>
        </div>

        <Card className="shadow-lg border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Tell us about your trip</CardTitle>
            <CardDescription>Fill in the details below and we'll generate a custom itinerary.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium"><MapPin className="w-4 h-4 mr-2" /> Destination</label>
                  <Input
                    placeholder="E.g. Paris, Tokyo, Bali"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium"><Calendar className="w-4 h-4 mr-2" /> Duration (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    placeholder="7"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium"><Users className="w-4 h-4 mr-2" /> Number of Travelers</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="2"
                    required
                    value={formData.travelers}
                    onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium"><Sparkles className="w-4 h-4 mr-2" /> Interests</label>
                  <Input
                    placeholder="Culture, Food, Adventure, Relaxation"
                    required
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating AI itinerary...
                  </span>
                ) : "Generate Itinerary"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50/50 border-red-200 mb-8">
            <CardContent className="p-6 text-center text-red-600">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="bg-purple-50/50 border-purple-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Your Custom Itinerary</h3>
              <div className="text-purple-700 mb-4 whitespace-pre-wrap text-left text-sm font-medium">{result}</div>
              <p className="text-sm text-purple-600 italic mt-6 pt-4 border-t border-purple-200">This itinerary has been saved to your account!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
