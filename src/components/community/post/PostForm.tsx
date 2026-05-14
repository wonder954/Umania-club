// "use client";

// import { useState, useEffect } from "react";
// import { User } from "firebase/auth";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { signInWithGoogle } from "@/lib/auth";
// import { useTextValidation } from "@/hooks/useTextValidation";

// type Props = {
//     user: User | null; // ← 未ログインも受け取れるように変更
//     onSubmit: (text: string, visibility: string) => void;
// };

// export default function PostForm({ user, onSubmit }: Props) {
//     const [text, setText] = useState("");
//     const [visibility, setVisibility] = useState("public");
//     const [groups, setGroups] = useState<any[]>([]);
//     const [loadingGroups, setLoadingGroups] = useState(false);
//     const { validate } = useTextValidation();
//     const [error, setError] = useState("");


//     // -----------------------------
//     // ログイン済みのときだけグループ取得
//     // -----------------------------
//     useEffect(() => {
//         if (!user) return; // 未ログインなら何もしない

//         const fetchGroups = async () => {
//             setLoadingGroups(true);
//             const q = query(
//                 collection(db, "groups"),
//                 where("members", "array-contains", user.uid)
//             );
//             const snap = await getDocs(q);
//             setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//             setLoadingGroups(false);
//         };

//         fetchGroups();
//     }, [user]);

//     // -----------------------------
//     // 投稿処理
//     // -----------------------------
//     const handleSubmit = () => {
//         const err = validate(text);
//         if (err) {
//             setError(err);
//             return;
//         }

//         setError("");
//         onSubmit(text.trim(), visibility);
//         setText("");
//     };


//     // -----------------------------
//     // 未ログイン時の UI（安全設計）
//     // -----------------------------
//     if (!user) {
//         return (
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
//                 <p className="text-gray-700 mb-3">投稿するにはログインが必要です</p>

//                 <button
//                     onClick={signInWithGoogle}
//                     className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-bold"
//                 >
//                     ログインして投稿する
//                 </button>
//             </div>
//         );
//     }

//     // -----------------------------
//     // ログイン済みの投稿フォーム
//     // -----------------------------
//     return (
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//             <textarea
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="投稿内容を入力..."
//                 className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
//             />

//             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}


//             {/* 公開範囲 */}
//             <div className="mt-3">
//                 <label className="text-sm text-gray-600">公開範囲</label>
//                 <select
//                     value={visibility}
//                     onChange={(e) => setVisibility(e.target.value)}
//                     className="w-full mt-1 p-2 border rounded-lg"
//                 >
//                     <option value="public">全体公開</option>

//                     {loadingGroups && (
//                         <option disabled>読み込み中...</option>
//                     )}

//                     {!loadingGroups &&
//                         groups.map((g) => (
//                             <option key={g.id} value={`group:${g.id}`}>
//                                 グループ限定：{g.name}
//                             </option>
//                         ))}
//                 </select>
//             </div>

//             <button
//                 onClick={handleSubmit}
//                 className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-bold"
//             >
//                 投稿する
//             </button>
//         </div>
//     );
// }