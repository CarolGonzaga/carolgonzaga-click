import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

  const firebaseConfig = {
    apiKey: "AIzaSyD0WA4qKdZqMKM-H86X-LGp15Q1D2Tz_DA",
    authDomain: "briefing-carolsite.firebaseapp.com",
    projectId: "briefing-carolsite",
    storageBucket: "briefing-carolsite.firebasestorage.app",
    messagingSenderId: "294671934487",
    appId: "1:294671934487:web:84eba188f67114ea3a6852"
  };

  const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };