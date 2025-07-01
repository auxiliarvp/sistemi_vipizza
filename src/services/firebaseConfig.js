// src/services/firebaseConfig.js

// Tu configuración de Firebase (rellena con tus datos)
var firebaseConfig = {
  apiKey: "AIzaSyDGtCY41fj9VfQQdRzQQN6U3LhgJoWS-6M",
  authDomain: "dbsistemivipizza.firebaseapp.com",
  projectId: "dbsistemivipizza",
  storageBucket: "dbsistemivipizza.firebasestorage.app",
  messagingSenderId: "718217980446",
  appId: "1:718217980446:web:09cf2558bfad0ce9d6dc0f"
};

// Inicializa Firebase (compat)
firebase.initializeApp(firebaseConfig);

// Exponer la instancia de Firestore en global
var db = firebase.firestore();
