import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

// ★ v2 は setGlobalOptions を export より前に書く
setGlobalOptions({ maxInstances: 10 });

export const onGroupDelete = onDocumentDeleted("groups/{groupId}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const subcollections = ["posts", "members", "notifications"];

    for (const sub of subcollections) {
        const ref = snap.ref.collection(sub);
        const docs = await ref.listDocuments();

        const batch = snap.ref.firestore.batch();
        docs.forEach((d) => batch.delete(d));
        await batch.commit();
    }
});