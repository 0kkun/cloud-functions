// firestore関連
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const envCredentials = functions.config().firestorecredentials;

export type Credential = {
  projectId: string,
  clientEmail: string,
  privateKey: string
}

const credentials: Credential = {
  projectId: envCredentials.project_id,
  privateKey: envCredentials.private_key.replace(/\\n/g, '\n'),
  clientEmail: envCredentials.client_email,
};

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
