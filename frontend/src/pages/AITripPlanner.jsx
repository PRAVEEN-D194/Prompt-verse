import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Sparkles, MapPin, Calendar, Users } from "lucide-react";
import { itineraryService } from "../services/itineraryService";

export const AITripPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    travelers: "",
    interests: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate AI generation time
    setTimeout(async () => {
      const prompt = `You are an expert AI Travel Planner for a Smart Tourism application.

Generate a personalized and detailed travel itinerary based on the following information:

* Destination: ${formData.destination}
* Duration: ${formData.duration} days
* Number of Travelers: ${formData.travelers}
* Interests: ${formData.interests}

Instructions:

1. Generate a complete itinerary for exactly ${formData.duration} days.
2. For each day include:

   * 🌅 Morning
   * ☀️ Afternoon
   * 🌆 Evening
   * 🍽️ Recommended breakfast, lunch, and dinner (local cuisine if possible)
   * 🚗 Suggested transportation between attractions
   * ⏱️ Estimated travel time
   * 💰 Estimated cost for the day's activities
   * 💡 Travel tips and precautions
3. Recommend the most popular attractions first, then hidden gems if time allows.
4. Arrange attractions in a logical order to minimize travel time.
5. Recommend family-friendly, couple-friendly, or solo-friendly activities based on the number of travelers.
6. Include opening hours where appropriate.
7. Suggest the best time to visit each attraction.
8. Mention any entry fees if applicable.
9. If the destination has famous local foods, recommend where to try them.
10. If the destination is known for shopping, include suitable markets or shopping streets.
11. Keep the itinerary realistic—do not overload a single day.
12. If the duration is longer than the number of major attractions, suggest nearby places, relaxation activities, local experiences, cultural events, or day trips.
13. Return the response in clean Markdown format.
14. Do not include explanations, disclaimers, or introductory text—only the itinerary.

Output format:

# Trip to ${formData.destination}

## Day 1

### 🌅 Morning

...

### ☀️ Afternoon

...

### 🌆 Evening

...

### 🍽️ Food Recommendations

...

### 🚗 Transportation

...

### 💰 Estimated Budget

...

### 💡 Travel Tips

...

Repeat the same structure for all ${formData.duration} days.

Finally include:

## Overall Trip Summary

* Total Estimated Budget
* Best Attractions Visited
* Local Foods to Try
* Things to Pack
* Emergency Contacts (if relevant)
* Safety Tips
* Best Souvenirs to Buy`;

      const mockResult = prompt;
      setResult(mockResult);
      setLoading(false);

      try {
        // Save to backend
        await itineraryService.createItinerary({
          title: `Trip to ${formData.destination}`,
          destination: formData.destination,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + parseInt(formData.duration) * 86400000).toISOString(),
          activities: [
            { day: 1, description: "Arrival and check-in" },
            { day: 2, description: mockResult }
          ]
        });
      } catch (error) {
        console.error("Error saving itinerary:", error);
      }
    }, 2000);
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
                {loading ? "Generating Magic..." : "Generate Itinerary"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-purple-50/50 border-purple-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Your Custom Itinerary</h3>
              <p className="text-purple-700 mb-4">{result}</p>
              <p className="text-sm text-purple-600 italic">This itinerary has been saved to your account!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
