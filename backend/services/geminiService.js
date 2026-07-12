const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client using GEMINI_API_KEY
// Note: Ensure this file is loaded after dotenv config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

const generateTripItinerary = async (data) => {
  const { destination, duration, travelers, interests } = data;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Invalid or missing Gemini API key configured.');
  }

  // Use the latest stable recommended model for text generation
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert AI Travel Planner for a Smart Tourism application.

Generate a personalized and detailed travel itinerary based on the following information:

* Destination: ${destination}
* Duration: ${duration} days
* Number of Travelers: ${travelers}
* Interests: ${interests}

Instructions:

1. Generate a complete itinerary for exactly ${duration} days.
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

# Trip to ${destination}

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

Repeat the same structure for all ${duration} days.

Finally include:

## Overall Trip Summary

* Total Estimated Budget
* Best Attractions Visited
* Local Foods to Try
* Things to Pack
* Emergency Contacts (if relevant)
* Safety Tips
* Best Souvenirs to Buy`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error('Failed to generate itinerary with Gemini API: ' + error.message);
  }
};

module.exports = {
  generateTripItinerary
};
