/**
 * Service for handling image uploads
 */
export const imageUploadService = {
  /**
   * Upload an image to the server
   * @param uri Local URI of the image to upload
   * @returns Promise resolving to the URL of the uploaded image
   */
  uploadImage: async (uri: string): Promise<string> => {
    try {
      // In a real app, this would upload to a server
      // For demo purposes, we'll just return a mock URL
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock URL
      return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
};

export default imageUploadService;