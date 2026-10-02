require('dotenv').config();
const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const playlistId = 'UUE9htC7NrruQiWite7dFFtA';
const max = 20;

fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId='+playlistId+'&maxResults='+max+'&key='+API_KEY)
  .then(res => res.json())
  .then(data => {
    if (!data.items) { console.log('No items', data); return; }
    const out = data.items.map((item, i) => {
      const vid = item.snippet.resourceId.videoId;
      return `  {
    id: 'so${i+22}',
    category: 'sonder',
    youtubeId: '${vid}',
    thumbnail: 'https://img.youtube.com/vi/${vid}/hqdefault.jpg',
    title: ${JSON.stringify(item.snippet.title)},
    channel: ${JSON.stringify(item.snippet.channelTitle)},
    channelAvatar: 'https://ui-avatars.com/api/?name=ROUSHAN&background=000&color=fff',
  },`;
    });
    console.log(out.join('\n'));
  });
