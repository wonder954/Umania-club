import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted, FirestoreEvent } from "firebase-functions/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const onGroupDelete = onDocumentDeleted("groups/{groupId}", async (event: FirestoreEvent<any>) => {
    const snap = event.data;
    if (!snap) return;

    const subcollections = ["posts", "members", "notifications"];

    for (const sub of subcollections) {
        const ref = snap.ref.collection(sub);
        const docs = await ref.listDocuments();

        const batch = snap.ref.firestore.batch();
        docs.forEach((d: FirebaseFirestore.DocumentReference) => batch.delete(d));
        await batch.commit();
    }
});
