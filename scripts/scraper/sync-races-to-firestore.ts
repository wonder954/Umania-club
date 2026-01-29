import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { fetchWeeklyRacesYahoo, fetchRaceEntriesDenma } from "./yahoo-scraper";
import { convertToRacesObject } from "./data-converter.js";
import { firebaseConfig } from "../../lib/firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncRacesToFirestore() {
    console.log("🏇 Yahoo!競馬から重賞データを取得して Firestore に保存します...\n");

    const weeklyRaces = await fetchWeeklyRacesYahoo();
    const racesWithHorses = [];

    for (const race of weeklyRaces) {
        try {
            const { info, entries } = await fetchRaceEntriesDenma(race.detailUrl);
            racesWithHorses.push({
                yahooRace: {
                    ...race,
                    originalDate: race.date,
                    date: info.date,
                    raceNumber: info.raceNumber,
                    place: info.place
                },
                horses: entries.map(e => ({
                    frame: e.frame,
                    number: e.number,
                    name: e.name,
                    sex: e.sex,
                    age: e.age,
                    jockey: e.jockey,
                    weight: e.weight,
                }))
            });
        } catch (err: any) {
            console.warn(`❌ ${race.title} の取得に失敗: ${err.message}`);
        }
    }

    const racesObject = convertToRacesObject(racesWithHorses);

    for (const [id, race] of Object.entries(racesObject)) {
        await setDoc(doc(db, "races", id), race as any);
        console.log(`✅ Firestore に保存: ${id} - ${(race as any).name}`);
    }

    console.log("\n🎉 Firestore への保存が完了しました！");
}

syncRacesToFirestore().catch(console.error);
