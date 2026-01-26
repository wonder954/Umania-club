import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { fetchWeeklyRacesYahoo, fetchRaceDetailYahoo } from "./yahoo-scraper.js";
import { convertToRacesObject } from "./data-converter.js";
import { firebaseConfig } from "../../lib/firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncRacesToFirestore() {
    console.log("🏇 Yahoo!競馬から重賞データを取得して Firestore に保存します...\n");

    const weeklyRaces = await fetchWeeklyRacesYahoo();
    const racesWithHorses = [];

    // @ts-ignore
    for (const race of weeklyRaces) {
        try {
            // @ts-ignore
            const { date, raceNumber, place, horses } = await fetchRaceDetailYahoo(race.detailUrl);
            racesWithHorses.push({
                yahooRace: {
                    ...race,
                    originalDate: race.date,
                    date,
                    raceNumber,
                    place
                },
                horses
            });
        } catch (err: any) {
            // @ts-ignore
            console.warn(`❌ ${race.title} の取得に失敗: ${err.message}`);
        }
    }

    const racesObject = convertToRacesObject(racesWithHorses);

    for (const [id, race] of Object.entries(racesObject)) {
        await setDoc(doc(db, "races", id), race);
        console.log(`✅ Firestore に保存: ${id} - ${race.name}`);
    }

    console.log("\n🎉 Firestore への保存が完了しました！");
}

syncRacesToFirestore().catch(console.error);