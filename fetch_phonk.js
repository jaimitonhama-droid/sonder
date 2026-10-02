const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

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
  let idCounter = 4000;
  let fetchedCount = 0;

  // 1. Encontrar Playlists de Phonk (1 pedido = 100 unidades, muito barato em termos de quota comparado com search de videos)
  console.log('Pesquisando playlists de Phonk...');
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=phonk+drift+aggressive&type=playlist&maxResults=20&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  if (!searchData.items) {
    console.error('Falha na pesquisa:', searchData);
    return;
  }

  const playlistIds = searchData.items.map(i => i.id.playlistId);
  console.log(`Encontradas ${playlistIds.length} playlists. A extrair vídeos...`);

  // 2. Extrair vídeos das playlists até chegar a 2000
  for (const pid of playlistIds) {
    if (validVideos.length >= 2000) break;
    
    let pageToken = '';
    console.log(`A extrair da playlist: ${pid}`);

    // Não extrair mais de 300 por playlist para manter variedade
    let plCount = 0;
    while (plCount < 300 && validVideos.length < 2000) {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${pid}&maxResults=50&key=${API_KEY}` + (pageToken ? `&pageToken=${pageToken}` : '');
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.items || data.items.length === 0) break;
      fetchedCount += data.items.length;
      plCount += data.items.length;
      pageToken = data.nextPageToken;

      const ids = data.items.map(item => item.snippet.resourceId.videoId).filter(Boolean);
      if (ids.length === 0) {
        if (!pageToken) break;
        continue;
      }

      // Procurar duração
      const vidUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(',')}&key=${API_KEY}`;
      const vidRes = await fetch(vidUrl);
      const vidData = await vidRes.json();

      const durationMap = {};
      if (vidData.items) {
        vidData.items.forEach(v => {
          durationMap[v.id] = parseDurationToSeconds(v.contentDetails.duration);
        });
      }

      for (const item of data.items) {
        if (validVideos.length >= 2000) break;

        const vid = item.snippet.resourceId.videoId;
        const sec = durationMap[vid] || 0;
        
        // Filtro de duração (2 a 10 mins)
        if (sec >= 120 && sec < 600) {
          validVideos.push(`  {
    id: 'ph${idCounter++}',
    category: 'phonk',
    youtubeId: '${vid}',
    thumbnail: 'https://img.youtube.com/vi/${vid}/hqdefault.jpg',
    title: ${JSON.stringify(item.snippet.title)},
    channel: ${JSON.stringify(item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle)},
    channelAvatar: 'https://ui-avatars.com/api/?name=PHONK&background=000&color=fff',
  },`);
        }
      }

      if (!pageToken) break;
    }
  }

  console.log(`Found ${validVideos.length} valid videos out of ${fetchedCount} fetched.`);

  if (validVideos.length > 0) {
    const feedPath = path.join(__dirname, 'src', 'data', 'feedVideos.js');
    let content = fs.readFileSync(feedPath, 'utf8');
    
    const injectionStr = `\n  // ── PHONK (Pesquisa Automática) ──\n` + validVideos.join('\n') + `\n];`;
    content = content.replace(/\];\s*export const CATEGORIES/, injectionStr + '\n\nexport const CATEGORIES');
    
    fs.writeFileSync(feedPath, content, 'utf8');
    console.log('Successfully injected into feedVideos.js');
  }
}

run().catch(console.error);
