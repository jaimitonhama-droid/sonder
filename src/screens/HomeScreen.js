import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

import NowPlayingBar  from '../components/NowPlayingBar';
import CategoryFilter from '../components/CategoryFilter';
import VideoCard      from '../components/VideoCard';
import ActionBar      from '../components/ActionBar';
import CommentsPanel  from '../components/CommentsPanel';

import { CATEGORIES, getVideosByCategory } from '../data/feedVideos';
import { fetchVideoDetails }               from '../services/youtubeApi';

// Altura da barra de status do Android
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
// Altura da ActionBar
const ACTION_BAR_H = 88;

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('destaque');
  // Embaralha inicialmente
  const [videos, setVideos] = useState(() => {
    return [...getVideosByCategory('destaque')].sort(() => Math.random() - 0.5);
  });
  
  // Substituímos activeVideoIndex por activeVideoObject para não perder a música ao mudar de categoria
  const [playingVideo, setPlayingVideo] = useState(null);
  const [videoMeta, setVideoMeta] = useState({});
  const [showComments, setShowComments] = useState(false);

  // Filtra vídeos com base na duração (rejeita < 2min e >= 10min)
  const displayVideos = videos.filter((v) => {
    const meta = videoMeta[v.youtubeId];
    if (!meta) return true; 
    const sec = meta.durationSeconds;
    if (sec !== undefined && (sec < 120 || sec >= 600)) {
      return false;
    }
    return true;
  });

  const loadMeta = useCallback(async (videosList) => {
    const ids  = videosList.map((v) => v.youtubeId);
    const data = await fetchVideoDetails(ids);
    setVideoMeta(data);
  }, []);

  useEffect(() => {
    loadMeta(videos);
  }, [videos, loadMeta]);

  // Função automática que muda a posição dos cards a cada 4 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      setVideos((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, 4 * 60 * 1000); // 4 minutos
    return () => clearInterval(interval);
  }, []);

  const handleCategoryChange = useCallback((catId) => {
    setActiveCategory(catId);
    const newVideos = [...getVideosByCategory(catId)].sort(() => Math.random() - 0.5);
    setVideos(newVideos);
    // NÃO mudamos o playingVideo aqui! Assim a música continua a tocar.
    setShowComments(false);
  }, []);

  const handleVideoSelect = useCallback((video) => {
    setPlayingVideo(video);
    setShowComments(false);
  }, []);

  // Para encontrar o vídeo atual na nova lista embaralhada
  const currentIdx = playingVideo ? displayVideos.findIndex(v => v.youtubeId === playingVideo.youtubeId) : -1;

  const handleVideoEnd = useCallback(() => {
    if (currentIdx !== -1 && currentIdx < displayVideos.length - 1) {
      setPlayingVideo(displayVideos[currentIdx + 1]);
    }
  }, [currentIdx, displayVideos]);

  const handleNextVideo = useCallback(() => {
    if (currentIdx !== -1 && currentIdx < displayVideos.length - 1) {
      setPlayingVideo(displayVideos[currentIdx + 1]);
    }
  }, [currentIdx, displayVideos]);

  const handlePrevVideo = useCallback(() => {
    if (currentIdx !== -1 && currentIdx > 0) {
      setPlayingVideo(displayVideos[currentIdx - 1]);
    }
  }, [currentIdx, displayVideos]);

  const activeMeta     = playingVideo ? videoMeta[playingVideo.youtubeId] : null;
  const displayTitle   = activeMeta?.title       || playingVideo?.title   || '';
  const displayChannel = activeMeta?.channelTitle || playingVideo?.channel || '';

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[st.header, { paddingTop: STATUS_BAR_H + 10 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => { setPlayingVideo(null); setShowComments(false); }}>
          <Text style={st.logo}>
            <Text style={{ color: '#fff' }}>S</Text>
            <Text style={{ color: '#E8192C' }}>onder</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* VÍDEO FIXO NO TOPO */}
      <NowPlayingBar
        activeVideo={playingVideo}
        displayTitle={displayTitle}
        displayChannel={displayChannel}
        onEnd={handleVideoEnd}
        onPrev={handlePrevVideo}
        onNext={handleNextVideo}
        canPrev={currentIdx > 0}
        canNext={currentIdx !== -1 && currentIdx < displayVideos.length - 1}
      />

      {/* Categorias agora ficam dentro da FlatList para rolarem junto com os vídeos */}

      {/* ÁREA INFERIOR: COMENTÁRIOS OU FEED */}
      <View style={{ flex: 1 }}>
        {showComments && playingVideo ? (
          <CommentsPanel 
            videoId={playingVideo.youtubeId} 
            onClose={() => setShowComments(false)} 
          />
        ) : (
          <FlatList
            ListHeaderComponent={() => (
              <View style={st.bottomContent}>
                <View style={st.sectionHeader}>
                  <Text style={st.sectionLabel}>
                    <Text style={st.sectionLabelBold}>A Passar</Text> em {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                  </Text>
                </View>
                <CategoryFilter
                  categories={CATEGORIES}
                  activeId={activeCategory}
                  onSelect={handleCategoryChange}
                />
                <View style={{ height: 10 }} />
              </View>
            )}
            data={displayVideos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => {
              const isActive = playingVideo && playingVideo.youtubeId === item.youtubeId;
              return (
                <VideoCard
                  video={{
                    ...item,
                    title:    videoMeta[item.youtubeId]?.title        || item.title,
                    channel:  videoMeta[item.youtubeId]?.channelTitle || item.channel,
                    duration: videoMeta[item.youtubeId]?.duration     || item.duration,
                  }}
                  isActive={isActive}
                  onPress={() => handleVideoSelect(item)}
                />
              );
            }}
            columnWrapperStyle={st.gridRow}
            contentContainerStyle={{ paddingBottom: ACTION_BAR_H + 24 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>

      {playingVideo && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100, elevation: 100 }} pointerEvents="box-none">
          <ActionBar
            likes={activeMeta?.likes || playingVideo?.likes || '0'}
            comments={activeMeta?.comments || playingVideo?.comments || '0'}
            shares={playingVideo?.shares || '0'}
            onCommentsPress={() => setShowComments(!showComments)}
          />
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08080F',
  },
  header: {
    backgroundColor: '#08080F',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  bottomContent: {
    backgroundColor: '#08080F',
    zIndex: 10,
    elevation: 10,
  },
  sectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  sectionLabelBold: {
    color: '#fff',
    fontWeight: '800',
  },
  gridRow: {
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 10,
  },
});
