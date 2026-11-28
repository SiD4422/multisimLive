# Firebase Authentication & Firestore Setup

## 1. Enable Sign-In Providers

Go to: **Firebase Console -> Authentication -> Sign-in method** and enable:

1. **Google**
   - Toggle **Enable**, set project support email, save.
2. **GitHub**
   - Create a GitHub OAuth App with callback URL `https://nodesim-2c84b.firebaseapp.com/__/auth/handler`.
   - Toggle **Enable**, enter Client ID & Client Secret, save.
3. **Authorized domains**
   - Ensure `www.nodesimapp.com`, `nodesimapp.com`, and `localhost` are listed under **Settings -> Authorized domains**.

## 2. Publish Firestore Security Rules

Go to: **Firebase Console -> Firestore -> Rules tab** -> paste the contents of [firestore.rules](./firestore.rules) -> **Publish**.
