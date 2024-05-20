import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// const firebaseConfig = {
//   apiKey: "AIzaSyAPxP12g9S_Yhy-yPx4tbA8-mEknruiEO8",
//   authDomain: "matthew-b6b70.firebaseapp.com",
//   // authDomain: "localhost:5001",
//   projectId: "matthew-b6b70",
//   storageBucket: "matthew-b6b70.appspot.com",
//   messagingSenderId: "149782274841",
//   appId: "1:149782274841:web:f3f5ccdd31060926705b88",
//   measurementId: "G-WL5YE4TKHC",
// };

//------------------//
const firebaseConfig = {
  apiKey: "AIzaSyDCGCdyoAU_aDpqvd1GbwYrz9tzeQEIsUw",
  authDomain: "argos-a8807.firebaseapp.com",
  databaseURL: "https://argos-a8807-default-rtdb.firebaseio.com",
  projectId: "argos-a8807",
  storageBucket: "argos-a8807.appspot.com",
  messagingSenderId: "1057758476555",
  appId: "1:1057758476555:web:afbf1a80682262ed254a0e",
  measurementId: "G-NXM2E9K7EN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
