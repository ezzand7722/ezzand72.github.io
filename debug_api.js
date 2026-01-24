
const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        console.log("Fetching recitations...");
        const recitations = await fetchJson('https://api.quran.com/api/v4/resources/recitations?language=en');
        const r9 = recitations.recitations.find(r => r.id === 9);
        console.log("Reciter 9 Info:", JSON.stringify(r9, null, 2));

        console.log("\nFetching timings for Surah 1, Reciter 9...");
        const timings = await fetchJson('https://api.quran.com/api/v3/chapters/1/verses?recitation=9&text_type=words');
        
        if (timings.verses) {
            console.log("First 2 verses:");
            timings.verses.slice(0, 2).forEach(v => {
                const segs = v.audio.segments;
                console.log(`Verse ${v.verse_number}: URL=${v.audio.url}`);
                if (segs && segs.length > 0) {
                     console.log(`  Segments: Start=${segs[0][1]}, End=${segs[segs.length-1][2]}`);
                }
            });
            console.log("Last verse:");
             const v = timings.verses[timings.verses.length-1];
             const segs = v.audio.segments;
             console.log(`Verse ${v.verse_number}: URL=${v.audio.url}`);
             if (segs && segs.length > 0) {
                  console.log(`  Segments: Start=${segs[0][1]}, End=${segs[segs.length-1][2]}`);
             }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
