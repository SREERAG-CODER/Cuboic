import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCZGQ8YwEiPitnt57ZoQKo38p4Vr6Vn7aM",
    authDomain: "testing-46731.firebaseapp.com",
    projectId: "testing-46731",
    storageBucket: "testing-46731.firebasestorage.app",
    messagingSenderId: "616558245113",
    appId: "1:616558245113:web:bd70a5a6091296e2075e28",
    measurementId: "G-WS6EVYMCJ9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
