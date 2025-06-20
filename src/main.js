// Punto de entrada (sin Node.js)
// Importa Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Importa tu configuración
import { firebaseConfig } from "./services/firebaseConfig.js";

// Inicializa Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
    <button class="btn btn-success" id="checkInBtn">Fichar entrada</button>
    <p class="mt-3" id="status"></p>
  `;

  const status = document.getElementById("status");
  document.getElementById("checkInBtn").addEventListener("click", () => {
    status.textContent = "Entrada registrada (demo) " + new Date().toLocaleString();
    // Aquí agregarías la lógica para guardar en Firestore
  });
});
