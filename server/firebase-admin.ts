import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { hasFirebaseAdminConfig, serverConfig } from "./config.js";

const getAdminApp = () => {
  const existing = getApps()[0];
  if (existing) return existing;
  if (!hasFirebaseAdminConfig()) throw new Error("Firebase Admin environment variables are not configured");

  return initializeApp({
    credential: cert({
      projectId: serverConfig.firebase.projectId!,
      clientEmail: serverConfig.firebase.clientEmail!,
      privateKey: serverConfig.firebase.privateKey!,
    }),
    projectId: serverConfig.firebase.projectId,
  });
};

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminFirestore = () => getFirestore(getAdminApp());
