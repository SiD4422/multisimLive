# Firebase Firestore Security Rules

Go to: Firebase Console → Firestore → Rules tab → paste these rules → Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /circuits/{circuitId} {
      allow read: if true;
      allow create: if request.resource.data.name is string
                    && request.resource.data.name.size() >= 1
                    && request.resource.data.name.size() <= 100
                    && request.resource.data.circuitData is string
                    && request.resource.data.circuitData.size() <= 80000;
      allow update, delete: if false;
    }
  }
}
```
