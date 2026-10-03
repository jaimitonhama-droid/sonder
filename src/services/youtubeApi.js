// Serviço para buscar dados reais dos vídeos via YouTube Data API v3
const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

function formatNumber(numStr) {
  if (!numStr) return '0';
  const num = parseInt(numStr, 10);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  return num.toString();
}

function formatDuration(ptStr) {
  if (!ptStr) return '0:00';
  const match = ptStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  const mm = h > 0 ? m.toString().padStart(2, '0') : m.toString();
  const ss = s.toString().padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

function parseDurationToSeconds(ptStr) {
  if (!ptStr) return 0;
  const match = ptStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  return h * 3600 + m * 60 + s;
}

/**
 * Busca detalhes de vídeos do YouTube por lista de IDs.
 * Divide automaticamente em lotes de 50 para suportar listas gigantes sem travar.
 */
export async function fetchVideoDetails(videoIds = []) {
  if (!videoIds.length) return {};

  const uniqueIds = [...new Set(videoIds)];
  const CHUNK_SIZE = 50; // Limite máximo da API do YouTube por pedido
  const result = {};

  try {
    const chunkPromises = [];
    
    // Cria os pedidos em pacotes de 50
    for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
      const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
      const ids = chunk.join(',');
      const url = `${BASE_URL}?part=snippet,statistics,contentDetails&id=${ids}&key=${API_KEY}`;
      chunkPromises.push(fetch(url).then(r => r.json()));
    }

    // Executa os pedidos em paralelo para ser rápido
    const responses = await Promise.all(chunkPromises);

    responses.forEach((json) => {
      if (json.items) {
        json.items.forEach((item) => {
          result[item.id] = {
            title:        item.snippet.title,
            description:  item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            thumbnail:    item.snippet.thumbnails?.maxres?.url
                       || item.snippet.thumbnails?.high?.url
                       || item.snippet.thumbnails?.medium?.url
                       || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
            views:        formatNumber(item.statistics?.viewCount) + ' visualizações',
            likes:        formatNumber(item.statistics?.likeCount),
            comments:     formatNumber(item.statistics?.commentCount),
            duration:     formatDuration(item.contentDetails?.duration),
            durationSeconds: parseDurationToSeconds(item.contentDetails?.duration),
          };
        });
      }
    });

    return result;
  } catch (err) {
    console.warn('[YouTubeAPI] Erro ao buscar detalhes:', err);
    return result; // Retorna os que conseguiu carregar
  }
}

/**
 * Pesquisa vídeos no YouTube por palavra-chave.
 * Retorna uma lista de vídeos com: id, title, channelTitle, thumbnail, duration
 */
export async function searchVideos(query = '', maxResults = 20) {
  if (!query.trim()) return [];

  const url = `${SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${API_KEY}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (!json.items) return [];

    return json.items.map((item) => ({
      id:           item.id.videoId,
      youtubeId:    item.id.videoId,
      title:        item.snippet.title,
      channel:      item.snippet.channelTitle,
      channelAvatar:`https://randomuser.me/api/portraits/lego/${Math.floor(Math.random()*8)+1}.jpg`,
      thumbnail:    item.snippet.thumbnails?.high?.url
                 || item.snippet.thumbnails?.medium?.url
                 || `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
      duration:     '–:––',
      views:        'YouTube',
      likes:        '0',
      comments:     '0',
      shares:       '0',
      category:     'search',
    }));
  } catch (err) {
    console.warn('[YouTubeAPI] Erro na pesquisa:', err);
    return [];
  }
}

/**
 * Busca comentários reais de um vídeo do YouTube.
 */
export async function fetchVideoComments(videoId, maxResults = 20) {
  if (!videoId) return [];

  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.items) return [];

    return json.items.map((item) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        author: snippet.authorDisplayName,
        avatar: snippet.authorProfileImageUrl,
        text: snippet.textOriginal,
        likes: formatNumber(snippet.likeCount),
        time: 'recentemente', // Opcional: formatar snippet.publishedAt
      };
    });
  } catch (err) {
    console.warn('[YouTubeAPI] Erro ao buscar comentarios:', err);
    return [];
  }
}

/**
 * Busca vídeos "Shorts" (duração curta) no YouTube.
 */
export async function fetchShorts(query = 'amapiano shorts') {
  const url = `${SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=short&maxResults=10&key=${API_KEY}`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (!json.items) return [];

    return json.items.map((item) => ({
      id:           item.id.videoId,
      youtubeId:    item.id.videoId,
      title:        item.snippet.title,
      channel:      item.snippet.channelTitle,
    }));
  } catch (err) {
    console.warn('[YouTubeAPI] Erro ao buscar Shorts:', err);
    return [];
  }
}

