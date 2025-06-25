// Mock Firebase service for development
// Replace with actual Firebase configuration when ready

export const auth = {
  currentUser: null,
};

export const db = {};

export const storage = {};

export const initializeFirebase = () => {
  console.log('Mock Firebase initialized successfully');
};

// Auth helpers
export const getCurrentUser = () => null;

export const onAuthStateChanged = (callback: (user: any) => void) => {
  // Mock implementation
  return () => {};
};

// Firestore helpers
export const createDocument = async (collectionName: string, data: any) => {
  console.log('Mock createDocument:', collectionName, data);
  return 'mock-doc-id';
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  console.log('Mock updateDocument:', collectionName, docId, data);
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  console.log('Mock deleteDocument:', collectionName, docId);
};

export const getDocument = async (collectionName: string, docId: string) => {
  console.log('Mock getDocument:', collectionName, docId);
  return null;
};

// Storage helpers
export const uploadImage = async (file: any, path: string) => {
  console.log('Mock uploadImage:', path);
  return 'mock-image-url';
};

// Real-time listeners
export const subscribeToCollection = (
  collectionName: string,
  queryObject: any,
  callback: (data: any[]) => void
) => {
  console.log('Mock subscribeToCollection:', collectionName);
  return () => {};
};

// Batch operations
export const batchWrite = async (operations: Array<{
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId?: string;
  data?: any;
}>) => {
  console.log('Mock batchWrite:', operations);
};

export default {
  auth,
  db,
  storage,
  initializeFirebase,
  getCurrentUser,
  onAuthStateChanged,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  uploadImage,
  subscribeToCollection,
  batchWrite,
};
