import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatSession, PropertyContext } from '@/types/chat';
import { generateUniqueId } from '@/utils/helpers';
import { sendChatMessage } from '@/services/ai-chatbot';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  propertyContext: PropertyContext | null;
  
  // Actions
  createSession: (title?: string, propertyContext?: PropertyContext | null) => string;
  setCurrentSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearCurrentSession: () => void;
  deleteSession: (sessionId: string) => void;
  setPropertyContext: (context: PropertyContext | null) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      propertyContext: null,

      createSession: (title = 'New Conversation', propertyContext = null) => {
        const sessionId = generateUniqueId();
        const newSession: ChatSession = {
          id: sessionId,
          title,
          lastUpdated: Date.now(),
          messages: [
            {
              id: generateUniqueId(),
              content: "Hello! I'm your AI property consultant. How can I help you with your property search today?",
              role: 'assistant',
              timestamp: Date.now(),
            },
          ],
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          propertyContext: propertyContext,
        }));

        return sessionId;
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      sendMessage: async (content) => {
        const { currentSessionId, sessions, propertyContext } = get();
        
        if (!currentSessionId) return;
        
        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (!currentSession) return;

        // Add user message
        const userMessageId = generateUniqueId();
        const userMessage: Message = {
          id: userMessageId,
          content,
          role: 'user',
          timestamp: Date.now(),
        };

        // Add temporary loading message for the assistant
        const assistantMessageId = generateUniqueId();
        const loadingMessage: Message = {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: Date.now(),
          isLoading: true,
        };

        // Update the session with both messages
        const updatedSessions = sessions.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, userMessage, loadingMessage],
              lastUpdated: Date.now(),
            };
          }
          return session;
        });

        set({ 
          sessions: updatedSessions,
          isLoading: true 
        });

        try {
          // Prepare context for the AI
          const contextMessages = currentSession.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));

          // Add property context if available
          let systemMessage = "You are an AI property consultant for a real estate app. Provide helpful, concise information about properties, market trends, and buying/renting advice.";
          
          if (propertyContext) {
            systemMessage += ` The user is currently viewing a ${propertyContext.propertyType} property`;
            if (propertyContext.propertyTitle) systemMessage += ` titled "${propertyContext.propertyTitle}"`;
            if (propertyContext.price) systemMessage += ` priced at $${propertyContext.price.toLocaleString()}`;
            if (propertyContext.location) systemMessage += ` located in ${propertyContext.location}`;
          }

          // Send to AI service
          const response = await sendChatMessage([
            { role: 'system', content: systemMessage },
            ...contextMessages,
            { role: 'user', content }
          ]);

          // Update the assistant message with the response
          const finalSessions = get().sessions.map(session => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return {
                      ...msg,
                      content: response.completion,
                      isLoading: false,
                    };
                  }
                  return msg;
                }),
              };
            }
            return session;
          });

          set({ 
            sessions: finalSessions,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error sending message to AI:', error);
          
          // Update the assistant message with an error
          const errorSessions = get().sessions.map(session => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return {
                      ...msg,
                      content: "I'm sorry, I couldn't process your request. Please try again later.",
                      isLoading: false,
                    };
                  }
                  return msg;
                }),
              };
            }
            return session;
          });

          set({ 
            sessions: errorSessions,
            isLoading: false 
          });
        }
      },

      clearCurrentSession: () => {
        const { currentSessionId, sessions } = get();
        
        if (!currentSessionId) return;
        
        const updatedSessions = sessions.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [
                {
                  id: generateUniqueId(),
                  content: "Hello! I'm your AI property consultant. How can I help you with your property search today?",
                  role: 'assistant',
                  timestamp: Date.now(),
                },
              ],
              lastUpdated: Date.now(),
            };
          }
          return session;
        });

        set({ sessions: updatedSessions });
      },

      deleteSession: (sessionId) => {
        const { currentSessionId, sessions } = get();
        
        const updatedSessions = sessions.filter(session => session.id !== sessionId);
        
        // If we're deleting the current session, set current to the most recent one
        let newCurrentId = currentSessionId;
        if (currentSessionId === sessionId) {
          newCurrentId = updatedSessions.length > 0 ? updatedSessions[0].id : null;
        }

        set({ 
          sessions: updatedSessions,
          currentSessionId: newCurrentId
        });
      },

      setPropertyContext: (context) => {
        set({ propertyContext: context });
      },

      renameSession: (sessionId, newTitle) => {
        const { sessions } = get();
        
        const updatedSessions = sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              title: newTitle,
            };
          }
          return session;
        });

        set({ sessions: updatedSessions });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);