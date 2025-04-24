import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';
import serviceAccount from "./private-key.json" assert { type: "json" }; 

const app = initializeApp({
    credential: credential.cert(serviceAccount as ServiceAccount),
});

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };