// This is a mock API service for demonstration purposes
// In a real app, you would replace this with actual API calls

import { User, LoginCredentials, RegisterData } from '@/types/user';
import { Property, PropertyFilter } from '@/types/property';
import { Transaction } from '@/types/transaction';
import { Review, ReviewType, ReviewSummary, ReviewFormData } from '@/types/review';
import { mockProperties } from '@/mocks/properties';
import { TransactionStatus, TransactionType, PaymentMethod, PaymentProvider } from './payment-gateway';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    preferences: {
      location: 'New York',
      priceRange: { min: 100000, max: 500000 },
      propertyTypes: ['Apartment', 'House'],
      bedrooms: 2,
      bathrooms: 2,
    },
    notificationPreferences: {
      newListings: true,
      inquiries: true,
      priceChanges: true,
      inquiryResponses: true,
      viewingScheduled: true,
      system: true,
      pushEnabled: true,
    },
    inquiries: [
      {
        id: 'inq1',
        propertyId: '1',
        propertyTitle: 'Luxury Apartment in Downtown',
        propertyType: 'Apartment',
        message: 'I am interested in this property. Can I schedule a viewing?',
        date: '2023-05-15T10:30:00.000Z',
        status: 'responded',
      },
      {
        id: 'inq2',
        propertyId: '3',
        propertyTitle: 'Modern Townhouse with Garden',
        propertyType: 'Townhouse',
        message: 'Is this property still available? What are the payment terms?',
        date: '2023-06-20T14:45:00.000Z',
        status: 'pending',
      },
    ],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'realtor',
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2023-02-01T00:00:00.000Z',
    subscription: {
      plan: 'premium',
      startDate: '2023-05-01T00:00:00.000Z',
      endDate: '2023-06-01T00:00:00.000Z',
      status: 'active',
    },
    notificationPreferences: {
      newListings: true,
      inquiries: true,
      priceChanges: true,
      inquiryResponses: true,
      viewingScheduled: true,
      system: true,
      pushEnabled: true,
    },
  },
];

// Mock transactions data
const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    userId: '1',
    propertyId: '1',
    propertyTitle: 'Luxury Apartment in Downtown',
    amount: 250000,
    currency: 'USD',
    type: TransactionType.FULL_PAYMENT,
    status: TransactionStatus.COMPLETED,
    provider: PaymentProvider.PAYSTACK,
    method: PaymentMethod.CARD,
    reference: 'ref_123456',
    description: 'Full payment for Luxury Apartment in Downtown',
    date: '2023-07-15T10:30:00.000Z',
    receiptUrl: 'https://api.paystack.co/receipts/tx_1',
  },
  {
    id: 'tx_2',
    userId: '1',
    propertyId: '3',
    propertyTitle: 'Modern Townhouse with Garden',
    amount: 5000,
    currency: 'USD',
    type: TransactionType.RENTAL_DEPOSIT,
    status: TransactionStatus.COMPLETED,
    provider: PaymentProvider.FLUTTERWAVE,
    method: PaymentMethod.CARD,
    reference: 'ref_789012',
    description: 'Rental deposit for Modern Townhouse with Garden',
    date: '2023-08-20T14:45:00.000Z',
    receiptUrl: 'https://api.flutterwave.com/receipts/tx_2',
  },
  {
    id: 'tx_3',
    userId: '1',
    propertyId: '5',
    propertyTitle: 'Beachfront Villa with Pool',
    amount: 10000,
    currency: 'USD',
    type: TransactionType.BOOKING_FEE,
    status: TransactionStatus.PENDING,
    provider: PaymentProvider.PAYSTACK,
    method: PaymentMethod.BANK_TRANSFER,
    reference: 'ref_345678',
    description: 'Booking fee for Beachfront Villa with Pool',
    date: '2023-09-05T09:15:00.000Z',
  },
  {
    id: 'tx_4',
    userId: '2',
    amount: 99,
    currency: 'USD',
    type: TransactionType.SUBSCRIPTION,
    status: TransactionStatus.COMPLETED,
    provider: PaymentProvider.FLUTTERWAVE,
    method: PaymentMethod.CARD,
    reference: 'ref_901234',
    description: 'Premium subscription renewal',
    date: '2023-06-01T00:00:00.000Z',
    receiptUrl: 'https://api.flutterwave.com/receipts/tx_4',
  },
];

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: 'rev_1',
    type: ReviewType.PROPERTY,
    targetId: '1',
    userId: '2',
    user: mockUsers[1],
    rating: {
      overall: 4.5,
      location: 5,
      value: 4,
      accuracy: 4.5
    },
    comment: "This apartment exceeded my expectations. The location is perfect, right in the heart of downtown with easy access to restaurants, shops, and public transportation. The property was exactly as described, and the amenities were top-notch. The only minor issue was that the kitchen was slightly smaller than it appeared in the photos, but it was still functional and well-equipped. The building staff were friendly and responsive. I would definitely recommend this property to anyone looking for a luxury apartment in the city.",
    title: "Excellent downtown apartment",
    helpful: 12,
    reported: false,
    status: 'approved',
    createdAt: '2023-06-10T14:30:00.000Z',
    updatedAt: '2023-06-10T14:30:00.000Z',
  },
  {
    id: 'rev_2',
    type: ReviewType.PROPERTY,
    targetId: '1',
    userId: '1',
    user: mockUsers[0],
    rating: {
      overall: 3.5,
      location: 5,
      value: 2,
      accuracy: 3.5
    },
    comment: "The location of this property is fantastic, but I think it's overpriced for what you get. The building amenities are nice, but the unit itself had some maintenance issues that should have been addressed before listing (leaky faucet, loose cabinet handles). The photos make the space look bigger than it actually is. The property manager was responsive when I reported the issues, though.",
    title: "Great location, but overpriced",
    helpful: 8,
    reported: false,
    status: 'approved',
    createdAt: '2023-07-05T09:15:00.000Z',
    updatedAt: '2023-07-05T09:15:00.000Z',
  },
  {
    id: 'rev_3',
    type: ReviewType.REALTOR,
    targetId: '2',
    userId: '1',
    user: mockUsers[0],
    rating: {
      overall: 5,
      professionalism: 5,
      responsiveness: 5,
      knowledge: 5
    },
    comment: "Jane was an absolute pleasure to work with. She was incredibly knowledgeable about the local market and helped us find our dream home in just two weeks. She was always available to answer our questions, even outside of business hours, and her negotiation skills saved us thousands of dollars. I would highly recommend Jane to anyone looking to buy or sell a property.",
    title: "The best realtor I've ever worked with",
    helpful: 15,
    reported: false,
    status: 'approved',
    createdAt: '2023-05-20T16:45:00.000Z',
    updatedAt: '2023-05-20T16:45:00.000Z',
  },
  {
    id: 'rev_4',
    type: ReviewType.PROPERTY,
    targetId: '3',
    userId: '2',
    user: mockUsers[1],
    rating: {
      overall: 4,
      location: 3,
      value: 5,
      accuracy: 4
    },
    comment: "This townhouse offers excellent value for the price. The garden is beautiful and well-maintained, and the interior is spacious and modern. The location is a bit far from downtown, but there's a bus stop nearby that makes commuting convenient. The listing was accurate, and the property manager was helpful during the viewing process.",
    title: "Great value townhouse",
    helpful: 6,
    reported: false,
    status: 'approved',
    createdAt: '2023-08-15T11:20:00.000Z',
    updatedAt: '2023-08-15T11:20:00.000Z',
  },
];

// Mock API service
export const mockApi = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
      await delay(1000);
      
      const user = mockUsers.find(
        (u) => u.email === credentials.email && credentials.password === 'password'
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      return {
        user,
        token: 'mock_token_' + Math.random().toString(36).substring(2),
      };
    },
    
    register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
      await delay(1000);
      
      if (mockUsers.some((u) => u.email === data.email)) {
        throw new Error('Email already in use');
      }
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: data.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          location: '',
          priceRange: { min: 0, max: 1000000 },
          propertyTypes: [],
          bedrooms: 0,
          bathrooms: 0,
        },
        inquiries: [],
      };
      
      mockUsers.push(newUser);
      
      return {
        user: newUser,
        token: 'mock_token_' + Math.random().toString(36).substring(2),
      };
    },
    
    resetPassword: async (email: string): Promise<void> => {
      await delay(1000);
      
      const user = mockUsers.find((u) => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In a real app, you would send a password reset email
      console.log(`Password reset email sent to ${email}`);
    },
    
    updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
      await delay(1000);
      
      const userIndex = mockUsers.findIndex((u) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...mockUsers[userIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      mockUsers[userIndex] = updatedUser;
      
      return updatedUser;
    },
  },
  
  properties: {
    getAll: async (): Promise<Property[]> => {
      await delay(1000);
      return mockProperties;
    },
    
    getById: async (id: string): Promise<Property> => {
      await delay(500);
      
      const property = mockProperties.find((p) => p.id === id);
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      return property;
    },
    
    filter: async (filters: PropertyFilter): Promise<Property[]> => {
      await delay(1000);
      
      return mockProperties.filter((property) => {
        // Filter by location
        if (filters.location && property.location && !property.location.city.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        // Filter by price range
        if (filters.priceRange) {
          const [minPrice, maxPrice] = filters.priceRange;
          if (property.price < minPrice || property.price > maxPrice) {
            return false;
          }
        }
        
        // Filter by property type
        if (filters.propertyType && filters.propertyType !== 'all' && property.type !== filters.propertyType) {
          return false;
        }
        
        // Filter by bedrooms
        if (filters.bedrooms && filters.bedrooms !== 'any') {
          const bedroomCount = parseInt(filters.bedrooms.toString());
          if (property.bedrooms < bedroomCount) {
            return false;
          }
        }
        
        // Filter by bathrooms
        if (filters.bathrooms && filters.bathrooms !== 'any') {
          const bathroomCount = parseInt(filters.bathrooms.toString());
          if (property.bathrooms < bathroomCount) {
            return false;
          }
        }
        
        // Filter by amenities
        if (filters.amenities && filters.amenities.length > 0) {
          // Check if property.amenities exists before filtering
          if (!property.amenities) {
            return false;
          }
          
          for (const amenity of filters.amenities) {
            if (!property.amenities.includes(amenity)) {
              return false;
            }
          }
        }
        
        return true;
      });
    },
    
    create: async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
      await delay(1500);
      
      const newProperty: Property = {
        id: `property_${Date.now()}`,
        ...property,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockProperties.push(newProperty);
      
      return newProperty;
    },
    
    update: async (id: string, data: Partial<Property>): Promise<Property> => {
      await delay(1000);
      
      const propertyIndex = mockProperties.findIndex((p) => p.id === id);
      
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }
      
      const updatedProperty = {
        ...mockProperties[propertyIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      mockProperties[propertyIndex] = updatedProperty;
      
      return updatedProperty;
    },
    
    delete: async (id: string): Promise<void> => {
      await delay(1000);
      
      const propertyIndex = mockProperties.findIndex((p) => p.id === id);
      
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }
      
      mockProperties.splice(propertyIndex, 1);
    },
  },
  
  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      await delay(1000);
      return mockTransactions;
    },
    
    getById: async (id: string): Promise<Transaction> => {
      await delay(500);
      
      const transaction = mockTransactions.find((t) => t.id === id);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    },
    
    getByUserId: async (userId: string): Promise<Transaction[]> => {
      await delay(800);
      
      return mockTransactions.filter((t) => t.userId === userId);
    },
    
    getByPropertyId: async (propertyId: string): Promise<Transaction[]> => {
      await delay(800);
      
      return mockTransactions.filter((t) => t.propertyId === propertyId);
    },
    
    create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
      await delay(1200);
      
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        ...transaction,
      };
      
      mockTransactions.push(newTransaction);
      
      return newTransaction;
    },
    
    update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
      await delay(1000);
      
      const transactionIndex = mockTransactions.findIndex((t) => t.id === id);
      
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      const updatedTransaction = {
        ...mockTransactions[transactionIndex],
        ...data,
      };
      
      mockTransactions[transactionIndex] = updatedTransaction;
      
      return updatedTransaction;
    },
  },
  
  reviews: {
    getAll: async (): Promise<Review[]> => {
      await delay(1000);
      return mockReviews;
    },
    
    getById: async (id: string): Promise<Review> => {
      await delay(500);
      
      const review = mockReviews.find((r) => r.id === id);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      return review;
    },
    
    getByUser: async (userId: string): Promise<Review[]> => {
      await delay(800);
      
      return mockReviews.filter((r) => r.userId === userId);
    },
    
    getByTarget: async (type: ReviewType, targetId: string): Promise<Review[]> => {
      await delay(800);
      
      return mockReviews.filter((r) => r.type === type && r.targetId === targetId);
    },
    
    getSummary: async (type: ReviewType, targetId: string): Promise<ReviewSummary> => {
      await delay(600);
      
      const targetReviews = mockReviews.filter((r) => r.type === type && r.targetId === targetId);
      
      if (targetReviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }
      
      // Calculate average overall rating
      const totalRating = targetReviews.reduce((sum, review) => sum + review.rating.overall, 0);
      const averageRating = totalRating / targetReviews.length;
      
      // Calculate rating distribution
      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };
      
      targetReviews.forEach(review => {
        const roundedRating = Math.round(review.rating.overall);
        if (roundedRating >= 1 && roundedRating <= 5) {
          ratingDistribution[roundedRating as keyof typeof ratingDistribution]++;
        }
      });
      
      // Calculate specific ratings based on type
      const summary: ReviewSummary = {
        averageRating,
        totalReviews: targetReviews.length,
        ratingDistribution
      };
      
      if (type === ReviewType.PROPERTY) {
        // Calculate property-specific ratings
        const locationRatings = targetReviews.filter(r => r.rating.location).map(r => r.rating.location as number);
        const valueRatings = targetReviews.filter(r => r.rating.value).map(r => r.rating.value as number);
        const accuracyRatings = targetReviews.filter(r => r.rating.accuracy).map(r => r.rating.accuracy as number);
        
        if (locationRatings.length > 0) {
          summary.locationRating = locationRatings.reduce((sum, rating) => sum + rating, 0) / locationRatings.length;
        }
        
        if (valueRatings.length > 0) {
          summary.valueRating = valueRatings.reduce((sum, rating) => sum + rating, 0) / valueRatings.length;
        }
        
        if (accuracyRatings.length > 0) {
          summary.accuracyRating = accuracyRatings.reduce((sum, rating) => sum + rating, 0) / accuracyRatings.length;
        }
      } else if (type === ReviewType.REALTOR) {
        // Calculate realtor-specific ratings
        const professionalismRatings = targetReviews.filter(r => r.rating.professionalism).map(r => r.rating.professionalism as number);
        const responsivenessRatings = targetReviews.filter(r => r.rating.responsiveness).map(r => r.rating.responsiveness as number);
        const knowledgeRatings = targetReviews.filter(r => r.rating.knowledge).map(r => r.rating.knowledge as number);
        
        if (professionalismRatings.length > 0) {
          summary.professionalismRating = professionalismRatings.reduce((sum, rating) => sum + rating, 0) / professionalismRatings.length;
        }
        
        if (responsivenessRatings.length > 0) {
          summary.responsivenessRating = responsivenessRatings.reduce((sum, rating) => sum + rating, 0) / responsivenessRatings.length;
        }
        
        if (knowledgeRatings.length > 0) {
          summary.knowledgeRating = knowledgeRatings.reduce((sum, rating) => sum + rating, 0) / knowledgeRatings.length;
        }
      }
      
      return summary;
    },
    
    create: async (data: Omit<ReviewFormData & { userId: string }, 'id'>): Promise<Review> => {
      await delay(1500);
      
      const user = mockUsers.find(u => u.id === data.userId);
      
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        type: data.type,
        targetId: data.targetId,
        userId: data.userId,
        user: user,
        rating: data.rating,
        comment: data.comment,
        title: data.title,
        images: data.images,
        helpful: 0,
        reported: false,
        status: 'pending', // New reviews are pending until approved
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockReviews.push(newReview);
      
      return newReview;
    },
    
    update: async (id: string, data: Partial<ReviewFormData>): Promise<Review> => {
      await delay(1000);
      
      const reviewIndex = mockReviews.findIndex((r) => r.id === id);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      const updatedReview = {
        ...mockReviews[reviewIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      mockReviews[reviewIndex] = updatedReview;
      
      return updatedReview;
    },
    
    delete: async (id: string): Promise<void> => {
      await delay(1000);
      
      const reviewIndex = mockReviews.findIndex((r) => r.id === id);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      mockReviews.splice(reviewIndex, 1);
    },
    
    markHelpful: async (id: string): Promise<void> => {
      await delay(500);
      
      const reviewIndex = mockReviews.findIndex((r) => r.id === id);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      mockReviews[reviewIndex].helpful += 1;
    },
    
    report: async (id: string, reason: string): Promise<void> => {
      await delay(500);
      
      const reviewIndex = mockReviews.findIndex((r) => r.id === id);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      mockReviews[reviewIndex].reported = true;
      
      // In a real app, you would store the reason and notify moderators
      console.log(`Review ${id} reported for reason: ${reason}`);
    },
  },
};