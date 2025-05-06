import { initializeApp, getApps, getApp } from 'firebase/app';
import Constants from 'expo-constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyDummyKeyForDevelopment",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "vitakey-realestate.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "vitakey-realestate",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "vitakey-realestate.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "123456789012",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:123456789012:web:abcdef1234567890",
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || "G-ABCDEFGHIJ"
};

// Initialize Firebase
let firebase;
if (getApps().length === 0) {
  firebase = initializeApp(firebaseConfig);
} else {
  firebase = getApp();
}

export default firebase;