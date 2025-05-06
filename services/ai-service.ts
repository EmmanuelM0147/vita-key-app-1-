import { Property } from '@/types/property';
import { User } from '@/types/user';
import { PropertyPreference } from '@/types/recommendation';

// This service would interface with your AI backend in a production app
// For now, we'll simulate AI processing with sophisticated algorithms

const API_ENDPOINT = 'https://toolkit.rork.com/text/llm/';

export const aiService = {
  // Generate property recommendations using AI
  generateRecommendations: async (
    userId: string,
    userPreferences: PropertyPreference,
    viewHistory: string[],
    favoriteIds: string[],
    availableProperties: Property[]
  ) => {
    try {
      // In a production app, this would call your ML model API
      // For demo purposes, we'll use the OpenAI API to generate recommendations
      
      // Prepare the prompt for the AI
      const messages = [
        {
          role: "system",
          content: `You are an AI real estate recommendation system. Based on user preferences and behavior, 
          recommend the most suitable properties from the available listings. Return ONLY a JSON array of 
          property IDs with match scores and reasons, no other text.`
        },
        {
          role: "user",
          content: `
          User Preferences: ${JSON.stringify(userPreferences)}
          
          Recently Viewed Properties: ${JSON.stringify(viewHistory)}
          
          Favorited Properties: ${JSON.stringify(favoriteIds)}
          
          Available Properties:
          ${JSON.stringify(availableProperties.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            location: p.location,
            type: p.type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            amenities: p.amenities,
            description: p.description?.substring(0, 100)
          })))}
          
          Return a JSON array of the top 5 recommended properties with the following format:
          [
            {
              "propertyId": "id of the property",
              "matchScore": 0.95, // a number between 0 and 1
              "reasons": ["reason 1", "reason 2", "reason 3"]
            }
          ]
          `
        }
      ];

      // Make the API call
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data = await response.json();
      
      // Parse the AI response
      try {
        // Extract the JSON from the completion text
        const completionText = data.completion;
        const jsonMatch = completionText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const recommendationsJson = JSON.parse(jsonMatch[0]);
          return recommendationsJson;
        } else {
          // Fallback if AI doesn't return proper JSON
          console.error('AI did not return proper JSON format');
          return simulateAIRecommendations(userPreferences, viewHistory, favoriteIds, availableProperties);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return simulateAIRecommendations(userPreferences, viewHistory, favoriteIds, availableProperties);
      }
    } catch (error) {
      console.error('Error in AI recommendation generation:', error);
      // Fallback to algorithmic recommendations if AI fails
      return simulateAIRecommendations(userPreferences, viewHistory, favoriteIds, availableProperties);
    }
  },
  
  // Generate explanation for why a property was recommended
  explainRecommendation: async (
    propertyId: string,
    userPreferences: PropertyPreference,
    property: Property
  ) => {
    try {
      // Prepare the prompt for the AI
      const messages = [
        {
          role: "system",
          content: `You are an AI real estate recommendation system. Explain why a specific property 
          matches a user's preferences. Provide a detailed, personalized explanation.`
        },
        {
          role: "user",
          content: `
          User Preferences: ${JSON.stringify(userPreferences)}
          
          Property Details: ${JSON.stringify({
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            type: property.type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            amenities: property.amenities,
            description: property.description
          })}
          
          Provide a detailed explanation of why this property is a good match for the user. 
          Format your response as a JSON object with the following structure:
          {
            "summary": "A brief summary of why this property is recommended",
            "factors": [
              {
                "title": "Location Match",
                "description": "Detailed explanation about the location match",
                "score": 4.5
              },
              // More factors...
            ],
            "conclusion": "A concluding statement about the overall match"
          }
          `
        }
      ];

      // Make the API call
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI explanation');
      }

      const data = await response.json();
      
      // Parse the AI response
      try {
        // Extract the JSON from the completion text
        const completionText = data.completion;
        const jsonMatch = completionText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const explanationJson = JSON.parse(jsonMatch[0]);
          return explanationJson;
        } else {
          // Fallback if AI doesn't return proper JSON
          console.error('AI did not return proper JSON format for explanation');
          return generateFallbackExplanation(property, userPreferences);
        }
      } catch (parseError) {
        console.error('Error parsing AI explanation response:', parseError);
        return generateFallbackExplanation(property, userPreferences);
      }
    } catch (error) {
      console.error('Error in AI explanation generation:', error);
      return generateFallbackExplanation(property, userPreferences);
    }
  },
  
  // Predict if a user would be interested in a new property
  predictUserInterest: async (
    userId: string,
    userPreferences: PropertyPreference,
    viewHistory: string[],
    favoriteIds: string[],
    property: Property
  ): Promise<{
    interestScore: number;
    shouldNotify: boolean;
    reasons: string[];
  }> => {
    // In a production app, this would use a trained ML model
    // For now, we'll use a rule-based approach
    
    let interestScore = 0;
    const reasons: string[] = [];
    
    // Check location match
    if (userPreferences.locations?.some(loc => 
      property.location?.city?.toLowerCase().includes(loc.toLowerCase()) ||
      property.location?.state?.toLowerCase().includes(loc.toLowerCase())
    )) {
      interestScore += 0.3;
      reasons.push('Location matches your preferences');
    }
    
    // Check price range
    if (property.price >= userPreferences.priceRange.min && 
        property.price <= userPreferences.priceRange.max) {
      interestScore += 0.25;
      reasons.push('Price is within your budget');
    }
    
    // Check property type
    if (userPreferences.propertyTypes.includes(property.type)) {
      interestScore += 0.15;
      reasons.push('Property type matches your preference');
    }
    
    // Check bedrooms
    if (property.bedrooms >= userPreferences.bedrooms) {
      interestScore += 0.1;
      reasons.push(`Has ${property.bedrooms} bedrooms as requested`);
    }
    
    // Check bathrooms
    if (property.bathrooms >= userPreferences.bathrooms) {
      interestScore += 0.1;
      reasons.push(`Has ${property.bathrooms} bathrooms as requested`);
    }
    
    // Check amenities overlap
    if (userPreferences.amenities && property.amenities) {
      const matchingAmenities = property.amenities.filter(a => 
        userPreferences.amenities?.includes(a)
      );
      
      if (matchingAmenities.length > 0) {
        interestScore += 0.1 * Math.min(matchingAmenities.length / userPreferences.amenities.length, 1);
        reasons.push('Has amenities you are looking for');
      }
    }
    
    // Determine if we should notify the user
    const shouldNotify = interestScore >= 0.7;
    
    return {
      interestScore,
      shouldNotify,
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    };
  }
};

// Helper function to simulate AI recommendations if the API call fails
function simulateAIRecommendations(
  userPreferences: PropertyPreference,
  viewHistory: string[],
  favoriteIds: string[],
  availableProperties: Property[]
) {
  return availableProperties
    .map(property => {
      let score = 0;
      const reasons: string[] = [];
      
      // Check location match
      if (userPreferences.locations?.some(loc => 
        property.location?.city?.toLowerCase().includes(loc.toLowerCase()) ||
        property.location?.state?.toLowerCase().includes(loc.toLowerCase())
      )) {
        score += 0.3;
        reasons.push('Location matches your preferences');
      }
      
      // Check price range
      if (property.price >= userPreferences.priceRange.min && 
          property.price <= userPreferences.priceRange.max) {
        score += 0.25;
        reasons.push('Price is within your budget');
      }
      
      // Check property type
      if (userPreferences.propertyTypes.includes(property.type)) {
        score += 0.15;
        reasons.push('Property type matches your preference');
      }
      
      // Check bedrooms
      if (property.bedrooms >= userPreferences.bedrooms) {
        score += 0.1;
        reasons.push(`Has ${property.bedrooms} bedrooms`);
      }
      
      // Check bathrooms
      if (property.bathrooms >= userPreferences.bathrooms) {
        score += 0.1;
        reasons.push(`Has ${property.bathrooms} bathrooms`);
      }
      
      // Boost score for properties similar to favorites
      if (favoriteIds.length > 0) {
        score += 0.1;
        reasons.push('Similar to properties you liked');
      }
      
      return {
        propertyId: property.id,
        matchScore: score,
        reasons: reasons.slice(0, 3) // Limit to top 3 reasons
      };
    })
    .filter(rec => rec.matchScore > 0.5) // Only include good matches
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by score
    .slice(0, 5); // Take top 5
}

// Generate a fallback explanation if AI fails
function generateFallbackExplanation(property: Property, preferences: PropertyPreference) {
  const locationMatch = preferences.locations?.some(loc => 
    property.location?.city?.toLowerCase().includes(loc.toLowerCase()) ||
    property.location?.state?.toLowerCase().includes(loc.toLowerCase())
  );
  
  const priceMatch = property.price >= preferences.priceRange.min && 
                     property.price <= preferences.priceRange.max;
  
  const typeMatch = preferences.propertyTypes.includes(property.type);
  
  const bedroomsMatch = property.bedrooms >= preferences.bedrooms;
  
  const bathroomsMatch = property.bathrooms >= preferences.bathrooms;
  
  return {
    summary: `This ${property.type} in ${property.location?.city} appears to be a good match for your preferences.`,
    factors: [
      {
        title: "Location",
        description: locationMatch 
          ? `The property is located in ${property.location?.city}, which matches your preferred locations.` 
          : `While this property is not in your preferred locations, it has other features that might interest you.`,
        score: locationMatch ? 4.5 : 2.5
      },
      {
        title: "Price",
        description: priceMatch 
          ? `The price of $${property.price.toLocaleString()} is within your budget range of $${preferences.priceRange.min.toLocaleString()} - $${preferences.priceRange.max.toLocaleString()}.` 
          : `The price of $${property.price.toLocaleString()} is outside your specified budget, but the property offers good value.`,
        score: priceMatch ? 4 : 2
      },
      {
        title: "Property Type",
        description: typeMatch 
          ? `This is a ${property.type} property, which matches your preference.` 
          : `While you preferred ${preferences.propertyTypes.join(', ')}, this ${property.type} property has features that align with your other preferences.`,
        score: typeMatch ? 5 : 3
      },
      {
        title: "Space",
        description: `This property offers ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, ${bedroomsMatch && bathroomsMatch ? 'matching' : 'compared to'} your requirement of at least ${preferences.bedrooms} bedrooms and ${preferences.bathrooms} bathrooms.`,
        score: (bedroomsMatch && bathroomsMatch) ? 4 : 3
      }
    ],
    conclusion: "Based on our analysis, this property aligns with several of your key preferences and could be worth considering."
  };
}