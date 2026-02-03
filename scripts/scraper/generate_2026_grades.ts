import axios from "axios";
import iconv from "iconv-lite";


import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

const URL = "https://www.jra.go.jp/datafile/seiseki/replay/2026/jyusyo.html";

async function main() {
    const res = await axios.get(URL, {
        responseType: "arraybuffer"  // ★ バイナリで取得
    });
    const html = iconv.decode(res.data, "Shift_JIS"); // ★ SJIS → UTF-8
    const $ = cheerio.load(html);




    console.log("tables:", $("table").length);
    console.log("tbl-data:", $("table.tbl-data").length);
    console.log("table class:", $("table").attr("class"));

    const results: Array<{
        id: string;
        name: string;
        grade: string;
        date: string;
    }> = [];

    $("table.basic.narrow-xy.striped.mt20 tr").each((i: number, el: any) => {
        const tds = $(el).find("td");
        if (tds.length < 3) return;

        const dateText = $(tds[0]).text().trim();

        const raceTd = $(tds[1]);

        const grade = raceTd.find(".grade_icon").text().trim();

        // レース名（GⅠ の場合は a タグ、GⅡ/GⅢ はテキスト）
        let name = "";

        // ① a タグがある場合（GⅠ）
        const a = raceTd.find("a");
        if (a.length > 0) {
            name = a.text().trim();
        } else {
            // ② a タグがない場合（GⅡ/GⅢ）
            name = raceTd
                .clone()
                .children(".grade_icon") // grade_icon だけ除外
                .remove()
                .end()
                .text()
                .trim();
        }

        const date = convertDate(dateText);
        const id = `${date}-${toId(name)}`;

        results.push({ id, name, grade, date });
    });

    const outPath = path.join(process.cwd(), "scripts/scraper/data/2026_grades.json");
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");

    console.log("DONE →", outPath);
}

function convertDate(text: string): string {
    const m = text.match(/(\d+)月(\d+)日/);
    if (!m) return "2026-01-01";
    const mm = m[1].padStart(2, "0");
    const dd = m[2].padStart(2, "0");
    return `2026-${mm}-${dd}`;
}

function toId(name: string): string {
    return name.replace(/[^\wぁ-んァ-ヶー一-龠]/g, "");
}

main();