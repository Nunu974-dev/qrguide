// ===================================================
// 🔥 Configuration Firebase QRGUIDE
// ===================================================

const firebaseConfig = {
    apiKey: "AIzaSyC4e3AVTuNPJSd3WySAiXkD19rRrHGRUqw",
    authDomain: "qrguide-59f5f.firebaseapp.com",
    projectId: "qrguide-59f5f",
    storageBucket: "qrguide-59f5f.firebasestorage.app",
    messagingSenderId: "712367149712",
    appId: "1:712367149712:web:48c9f0fd95be1f940d3e15",
    measurementId: "G-H6DL6HDWSN"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Services Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
