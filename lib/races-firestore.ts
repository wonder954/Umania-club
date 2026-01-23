
import type { Race } from "@/lib/races";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getAllRacesFromFirestore(): Promise<Race[]> {
    const snapshot = await getDocs(collection(db, "races"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Race[];
}