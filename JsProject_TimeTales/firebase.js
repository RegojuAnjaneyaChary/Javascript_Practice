
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
  import{getFirestore} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
  import { getStorage } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-storage.js";


  const firebaseConfig = {
    apiKey: "AIzaSyBcJgCpZ2bycuewjgGFMRQdEg7OKJWYbtA",
    authDomain: "time-tales-cc100.firebaseapp.com",
    projectId: "time-tales-cc100",
    storageBucket: "time-tales-cc100.appspot.com",
    messagingSenderId: "485476051525",
    appId: "1:485476051525:web:3cd5983989892abef4512c",
    measurementId: "G-2MYHRGRJSR"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);