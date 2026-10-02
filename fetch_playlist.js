const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const playlistId = 'UUanSyv42rMvtbF0i05iWhDw'; // Anna Joyce Uploads

function parseDurationToSeconds(ptStr) {
  if (!ptStr) return 0;
  const match = ptStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  return h * 3600 + m * 60 + s;
}

async function run() {
  let validVideos = [];
  let pageToken = '';
  let fetchedCount = 0;
  let idCounter = 3500; // Garantir IDs únicos

  while (fetchedCount < 1000) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}` + (pageToken ? `&pageToken=${pageToken}` : '');
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) break;
    fetchedCount += data.items.length;
    pageToken = data.nextPageToken;

    const ids = data.items.map(item => item.snippet.resourceId.videoId).join(',');
    const vidUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`;
    const vidRes = await fetch(vidUrl);
    const vidData = await vidRes.json();

    const durationMap = {};
    if (vidData.items) {
      vidData.items.forEach(v => {
        durationMap[v.id] = parseDurationToSeconds(v.contentDetails.duration);
      });
    }

    for (const item of data.items) {
      const vid = item.snippet.resourceId.videoId;
      const sec = durationMap[vid] || 0;
      if (sec >= 120 && sec < 600) {
        validVideos.push(`  {
    id: 'kz${idCounter++}',
    category: 'kizomba',
    youtubeId: '${vid}',
    thumbnail: 'https://img.youtube.com/vi/${vid}/hqdefault.jpg',
    title: ${JSON.stringify(item.snippet.title)},
    channel: ${JSON.stringify(item.snippet.channelTitle)},
    channelAvatar: 'https://ui-avatars.com/api/?name=Anna+Joyce&background=000&color=fff',
  },`);
      }
    }

    if (!pageToken) break;
  }

  console.log(`Found ${validVideos.length} valid videos out of ${fetchedCount} fetched.`);

  if (validVideos.length > 0) {
    const feedPath = path.join(__dirname, 'src', 'data', 'feedVideos.js');
    let content = fs.readFileSync(feedPath, 'utf8');
    
    const injectionStr = `\n  // ── KIZOMBA (Anna Joyce) ──\n` + validVideos.join('\n') + `\n];`;
    content = content.replace(/\];\s*export const CATEGORIES/, injectionStr + '\n\nexport const CATEGORIES');
    
    fs.writeFileSync(feedPath, content, 'utf8');
    console.log('Successfully injected into feedVideos.js');
  }
}

run().catch(console.error);
