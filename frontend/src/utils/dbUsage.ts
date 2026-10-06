import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean, remaining: number }> {
  const userRef = doc(db, 'users', userId);
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // New user, create document
    await setDoc(userRef, {
      labReportsUsed: 1,
      lastResetMonth: currentMonth,
      isPro: false
    });
    return { allowed: true, remaining: 2 };
  }

  const data = userSnap.data();
  let { labReportsUsed, lastResetMonth, isPro } = data;

  if (isPro) {
    return { allowed: true, remaining: 999 }; // Unlimited for pro
  }

  if (lastResetMonth !== currentMonth) {
    // Reset for new month
    labReportsUsed = 0;
    lastResetMonth = currentMonth;
  }

  if (labReportsUsed < 3) {
    await updateDoc(userRef, {
      labReportsUsed: labReportsUsed + 1,
      lastResetMonth
    });
    return { allowed: true, remaining: 3 - (labReportsUsed + 1) };
  } else {
    // Update month even if they failed, just in case
    if (data.lastResetMonth !== currentMonth) {
      await updateDoc(userRef, { lastResetMonth });
    }
    return { allowed: false, remaining: 0 };
  }
}
