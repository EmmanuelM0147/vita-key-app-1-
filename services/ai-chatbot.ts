import { Message } from '@/types/chat';
import { Property, PropertyLocation } from '@/types/property';
import usePropertiesStore from '@/store/properties-store';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  completion: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in AI chat service:', error);
    throw error;
  }
}

export function generatePropertySummary(property: Property): string {
  const { title, price, location, bedrooms, bathrooms, area, description, amenities } = property;
  
  let summary = `${title} is a ${bedrooms} bedroom, ${bathrooms} bathroom property`;
  
  if (typeof location === 'string') {
    summary += ` located in ${location}`;
  } else if (location && location.city) {
    summary += ` located in ${location.city}`;
    if (location.state) summary += `, ${location.state}`;
  }
  
  summary += ` priced at $${price.toLocaleString()}`;
  
  if (area) {
    summary += ` with ${area} sq ft of space`;
  }
  
  if (amenities && amenities.length > 0) {
    summary += `. Features include: ${amenities.slice(0, 3).join(', ')}`;
    if (amenities.length > 3) summary += ` and ${amenities.length - 3} more amenities`;
  }
  
  return summary;
}

export function generateMarketInsights(location: string): string {
  // In a real app, this would fetch real data from an API
  const insights: Record<string, string> = {
    "New York": "The New York real estate market is currently seeing high demand with limited inventory, pushing prices up by 8% year-over-year. Luxury properties in Manhattan are particularly sought after.",
    "Los Angeles": "Los Angeles property values have increased by 12% in the last year, with the highest growth in areas like Silver Lake and Echo Park. The rental market remains strong with 5% annual increases.",
    "Chicago": "Chicago offers good investment opportunities with more affordable prices than coastal cities. Downtown condos have seen modest 3% appreciation, while suburban single-family homes are up 7%.",
    "Miami": "Miami continues to attract international buyers, with property values up 15% year-over-year. Waterfront properties command significant premiums, often 40% higher than comparable inland properties.",
    "Austin": "Austin remains one of the hottest markets in the US with 18% annual price growth. Tech industry expansion continues to drive demand, especially in the luxury segment.",
    "Seattle": "Seattle prices have stabilized after years of rapid growth, with a modest 4% increase year-over-year. The rental market remains strong with low vacancy rates.",
    "Denver": "Denver's market shows steady 6% annual appreciation with particularly strong demand for properties near public transportation and downtown."
  };
  
  // Find the closest matching location or return a generic insight
  const matchingLocation = Object.keys(insights).find(key => 
    location.toLowerCase().includes(key.toLowerCase())
  );
  
  if (matchingLocation) {
    return insights[matchingLocation];
  }
  
  return "The real estate market has been showing resilience with national average price increases of 5-7% annually. Urban centers continue to command premium prices, while suburban areas offer better value for space.";
}

export function searchPropertiesByQuery(query: string): Property[] {
  const { properties } = usePropertiesStore.getState();
  
  if (!properties || properties.length === 0) {
    return [];
  }
  
  const searchTerms = query.toLowerCase().split(' ');
  
  return properties.filter((property: Property) => {
    // Check if property matches search terms
    const propertyText = [
      property.title,
      property.description,
      typeof property.location === 'string' ? property.location : 
        (property.location ? `${property.location.city} ${property.location.state || ''}` : ''),
      property.type, // Changed from propertyType to type
      ...(property.amenities || [])
    ].join(' ').toLowerCase();
    
    // Property matches if it contains all search terms
    return searchTerms.every(term => propertyText.includes(term));
  });
}

export function generateQuickReplies(message: string): string[] {
  // Based on the last message, suggest relevant follow-up questions
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return [
      'Is this price negotiable?',
      'How does this compare to market average?',
      'What are the additional costs?'
    ];
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('neighborhood')) {
    return [
      'What amenities are nearby?',
      'How is the school district?',
      'Is public transportation available?'
    ];
  }
  
  if (lowerMessage.includes('mortgage') || lowerMessage.includes('loan') || lowerMessage.includes('financing')) {
    return [
      'What mortgage rates can I expect?',
      'What down payment is typically required?',
      'Are there first-time buyer programs?'
    ];
  }
  
  // Default suggestions
  return [
    'Tell me about property trends',
    'What should I look for in a good investment?',
    'How do I schedule a viewing?'
  ];
}