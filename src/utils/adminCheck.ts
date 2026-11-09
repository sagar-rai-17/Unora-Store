import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
export const checkIsAdmin = async (uid: string) => {
  const adminDoc = await getDoc(doc(db, "admins", uid));
  return adminDoc.exists();
};