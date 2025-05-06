import { Property, PropertyFeature, PropertyType } from '@/types/property';
import { imageUploadService } from '@/services/image-upload';

// API endpoint for AI image analysis
const AI_ENDPOINT = 'https://toolkit.rork.com/text/llm/';

/**
 * Service for handling AI-powered image recognition and property matching
 */
export const imageRecognitionService = {
  /**
   * Analyze an image to extract property features and characteristics
   * @param imageUri URI of the image to analyze
   * @returns Promise resolving to extracted property features
   */
  analyzePropertyImage: async (imageUri: string): Promise<{
    propertyType?: PropertyType;
    estimatedBedrooms?: number;
    estimatedBathrooms?: number;
    detectedFeatures: PropertyFeature[];
    architecturalStyle?: string;
    condition?: string;
    outdoorSpace?: boolean;
    confidence: number;
  }> => {
    try {
      // First upload the image to get a URL
      const imageUrl = await imageUploadService.uploadImage(imageUri);
      
      // Prepare the prompt for the AI
      const messages = [
        {
          role: "system",
          content: `You are an AI real estate image analyzer. Analyze the property image and extract key features.
          Return ONLY a JSON object with the following structure, no other text:
          {
            "propertyType": "house|apartment|condo|townhouse|commercial|land",
            "estimatedBedrooms": number,
            "estimatedBathrooms": number,
            "detectedFeatures": [
              {"name": "feature name", "description": "brief description", "confidence": 0-1}
            ],
            "architecturalStyle": "style name",
            "condition": "excellent|good|fair|poor",
            "outdoorSpace": true|false,
            "confidence": 0-1
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this property image and extract key features:"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      // Make the API call
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      // Parse the AI response
      try {
        // Extract the JSON from the completion text
        const completionText = data.completion;
        const jsonMatch = completionText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          return {
            propertyType: analysisResult.propertyType,
            estimatedBedrooms: analysisResult.estimatedBedrooms,
            estimatedBathrooms: analysisResult.estimatedBathrooms,
            detectedFeatures: analysisResult.detectedFeatures || [],
            architecturalStyle: analysisResult.architecturalStyle,
            condition: analysisResult.condition,
            outdoorSpace: analysisResult.outdoorSpace,
            confidence: analysisResult.confidence || 0.7,
          };
        } else {
          // Fallback if AI doesn't return proper JSON
          console.error('AI did not return proper JSON format');
          return {
            detectedFeatures: [],
            confidence: 0.5,
          };
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          detectedFeatures: [],
          confidence: 0.5,
        };
      }
    } catch (error) {
      console.error('Error in image analysis:', error);
      throw error;
    }
  },
  
  /**
   * Find visually similar properties based on an image
   * @param imageUri URI of the image to match
   * @param properties List of properties to search through
   * @returns Promise resolving to an array of properties with similarity scores
   */
  findSimilarProperties: async (
    imageUri: string,
    properties: Property[]
  ): Promise<Array<Property & { similarityScore: number; matchReasons: string[] }>> => {
    try {
      // First upload the image to get a URL
      const imageUrl = await imageUploadService.uploadImage(imageUri);
      
      // Extract features from the image
      const imageAnalysis = await this.analyzePropertyImage(imageUri);
      
      // Prepare the prompt for the AI
      const messages = [
        {
          role: "system",
          content: `You are an AI real estate visual matching system. Compare the uploaded image with the 
          available properties and find the most visually similar ones. Return ONLY a JSON array of property IDs 
          with similarity scores and match reasons, no other text.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Find properties that visually match this image. 
              
              Image Analysis: ${JSON.stringify(imageAnalysis)}
              
              Available Properties:
              ${JSON.stringify(properties.map(p => ({
                id: p.id,
                title: p.title,
                type: p.type,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                amenities: p.amenities,
                features: p.features,
                images: p.images?.[0] ? [p.images[0]] : []
              })))}
              
              Return a JSON array with the following format:
              [
                {
                  "propertyId": "id of the property",
                  "similarityScore": 0.95, // a number between 0 and 1
                  "matchReasons": ["reason 1", "reason 2", "reason 3"]
                }
              ]`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      // Make the API call
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to find similar properties');
      }

      const data = await response.json();
      
      // Parse the AI response
      try {
        // Extract the JSON from the completion text
        const completionText = data.completion;
        const jsonMatch = completionText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const matchResults = JSON.parse(jsonMatch[0]);
          
          // Map the results to properties
          return matchResults.map((match: any) => {
            const property = properties.find(p => p.id === match.propertyId);
            if (!property) return null;
            
            return {
              ...property,
              similarityScore: match.similarityScore,
              matchReasons: match.matchReasons || []
            };
          }).filter(Boolean);
        } else {
          // Fallback if AI doesn't return proper JSON format
          console.error('AI did not return proper JSON format for similar properties');
          return fallbackSimilarityMatching(imageAnalysis, properties);
        }
      } catch (parseError) {
        console.error('Error parsing AI similarity response:', parseError);
        return fallbackSimilarityMatching(imageAnalysis, properties);
      }
    } catch (error) {
      console.error('Error finding similar properties:', error);
      throw error;
    }
  }
};

/**
 * Fallback function to match properties based on extracted features
 * when AI matching fails
 */
function fallbackSimilarityMatching(
  imageAnalysis: any,
  properties: Property[]
): Array<Property & { similarityScore: number; matchReasons: string[] }> {
  return properties
    .map(property => {
      let score = 0;
      const reasons: string[] = [];
      
      // Match property type
      if (imageAnalysis.propertyType && property.type === imageAnalysis.propertyType) {
        score += 0.3;
        reasons.push(`Property type (${property.type}) matches the image`);
      }
      
      // Match bedrooms
      if (imageAnalysis.estimatedBedrooms && 
          Math.abs(property.bedrooms - imageAnalysis.estimatedBedrooms) <= 1) {
        score += 0.2;
        reasons.push(`Similar number of bedrooms (${property.bedrooms})`);
      }
      
      // Match bathrooms
      if (imageAnalysis.estimatedBathrooms && 
          Math.abs(property.bathrooms - imageAnalysis.estimatedBathrooms) <= 1) {
        score += 0.2;
        reasons.push(`Similar number of bathrooms (${property.bathrooms})`);
      }
      
      // Match features
      if (imageAnalysis.detectedFeatures && imageAnalysis.detectedFeatures.length > 0) {
        const featureNames = imageAnalysis.detectedFeatures.map((f: any) => f.name.toLowerCase());
        
        // Check property amenities
        if (property.amenities) {
          const matchingAmenities = property.amenities.filter(
            a => featureNames.some(f => a.toLowerCase().includes(f))
          );
          
          if (matchingAmenities.length > 0) {
            score += 0.1 * Math.min(matchingAmenities.length / featureNames.length, 1);
            reasons.push('Has similar amenities');
          }
        }
        
        // Check property features
        if (property.features) {
          const matchingFeatures = property.features.filter(
            f => featureNames.some(name => f.name.toLowerCase().includes(name))
          );
          
          if (matchingFeatures.length > 0) {
            score += 0.1 * Math.min(matchingFeatures.length / featureNames.length, 1);
            reasons.push('Has similar features');
          }
        }
      }
      
      // Only include properties with a reasonable match score
      return {
        ...property,
        similarityScore: score,
        matchReasons: reasons
      };
    })
    .filter(p => p.similarityScore > 0.2) // Only include reasonable matches
    .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by score
    .slice(0, 5); // Take top 5
}

export default imageRecognitionService;