// ESM module: initializes Firebase and exports Firestore instance

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDGtCY41fj9VfQQdRzQQN6U3LhgJoWS-6M",
  authDomain: "dbsistemivipizza.firebaseapp.com",
  projectId: "dbsistemivipizza",
  storageBucket: "dbsistemivipizza.firebasestorage.app",
  messagingSenderId: "718217980446",
  appId: "1:718217980446:web:09cf2558bfad0ce9d6dc0f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
