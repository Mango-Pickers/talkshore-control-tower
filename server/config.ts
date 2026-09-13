const splitOrigins = (value: string | undefined) =>
  value?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];

export const serverConfig = {
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  version: process.env.API_VERSION ?? "1.0.0",
  allowedOrigins: splitOrigins(process.env.API_ALLOWED_ORIGINS),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
};

export const hasFirebaseAdminConfig = () =>
  Boolean(serverConfig.firebase.projectId && serverConfig.firebase.clientEmail && serverConfig.firebase.privateKey);
