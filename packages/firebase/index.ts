import { initializeApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth';
import firebaseKey from "./private-key.json";  

const app = initializeApp({
    apiKey: firebaseKey.apiKey,
    authDomain: firebaseKey.authDomain,
    projectId: firebaseKey.projectId,
    storageBucket: firebaseKey.storageBucket,
    messagingSenderId: firebaseKey.messagingSenderId,
    appId: firebaseKey.appId,
    measurementId: firebaseKey.measurementId,
});

const auth = getAuth(app);

export { auth };

