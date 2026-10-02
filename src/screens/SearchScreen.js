import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchVideos, fetchVideoDetails } from '../services/youtubeApi';
import NowPlayingBar from '../components/NowPlayingBar';
import ActionBar from '../components/ActionBar';
import CommentsPanel from '../components/CommentsPanel';

const { width: W } = Dimensions.get('window');
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
const ACTION_BAR_H = 88;
const CARD_W = (W - 14 * 2 - 10) / 2;
const CARD_H = CARD_W * (9 / 16);

// Sugestões de pesquisa rápida
const QUICK = [
  { id: 'q1', label: '🔥 Amapiano 2024',    query: 'Amapiano 2024' },
  { id: 'q2', label: '💃 Kizomba',          query: 'Kizomba Angola' },
  { id: 'q3', label: '🎵 Afrobeats',        query: 'Afrobeats hits 2024' },
  { id: 'q4', label: '🚗 Phonk',            query: 'Phonk drift 2024' },
  { id: 'q5', label: '🌍 Afropop',          query: 'Afropop hits' },
  { id: 'q6', label: '🎤 Hip-Hop Angola',   query: 'Hip Hop Angola 2024' },
];

export default function SearchScreen() {
  const [query,            setQuery]            = useState('');
  const [results,          setResults]          = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [searched,         setSearched]         = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [showComments,     setShowComments]     = useState(false);
  const inputRef = useRef(null);

  const activeVideo = results[activeVideoIndex] || null;
  const displayTitle   = activeVideo?.title   || '';
  const displayChannel = activeVideo?.channel || '';

  const doSearch = useCallback(async (q) => {
    const term = q || query;
    if (!term.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setActiveVideoIndex(null);
    try {
      const items = await searchVideos(term, 20);
      
      // Busca as estatísticas reais (views, likes, duration) dos resultados
      const ids = items.map(i => i.youtubeId);
      const meta = await fetchVideoDetails(ids);
      
      const enrichedItems = items.map(item => ({
        ...item,
        views:    meta[item.youtubeId]?.views    || item.views,
        duration: meta[item.youtubeId]?.duration || item.duration,
        durationSeconds: meta[item.youtubeId]?.durationSeconds || 0,
        likes:    meta[item.youtubeId]?.likes    || item.likes,
        comments: meta[item.youtubeId]?.comments || item.comments,
      })).filter(item => {
        const sec = item.durationSeconds;
        // Remove vídeos com menos de 2 minutos (120s) e maiores/iguais a 10 minutos (600s)
        return sec >= 120 && sec < 600;
      });

      setResults(enrichedItems);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleQuick = useCallback((q) => {
    setQuery(q);
    doSearch(q);
  }, [doSearch]);

  const handleVideoEnd = useCallback(() => {
    setActiveVideoIndex((prev) => {
      if (prev !== null && prev < results.length - 1) return prev + 1;
      return prev;
    });
  }, [results.length]);

  const handleNext = useCallback(() => {
    if (activeVideoIndex !== null && activeVideoIndex < results.length - 1)
      setActiveVideoIndex(activeVideoIndex + 1);
  }, [activeVideoIndex, results.length]);

  const handlePrev = useCallback(() => {
    if (activeVideoIndex !== null && activeVideoIndex > 0)
      setActiveVideoIndex(activeVideoIndex - 1);
  }, [activeVideoIndex]);

  const renderCard = ({ item, index }) => (
    <TouchableOpacity
      style={[st.card, index === activeVideoIndex && st.cardActive]}
      onPress={() => setActiveVideoIndex(index)}
      activeOpacity={0.82}
    >
      <View style={st.thumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={st.thumb} resizeMode="cover" />
        
        <View style={st.durationBadge}>
          <Text style={st.durationText}>{item.duration}</Text>
        </View>

        {index === activeVideoIndex && (
          <View style={st.activeBadge}>
            <Ionicons name="play-circle" size={28} color="#E8192C" />
          </View>
        )}
      </View>
      <View style={st.cardInfo}>
        <Text style={st.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={st.cardChannel} numberOfLines={1}>{item.channel}</Text>
        <View style={st.cardStatsRow}>
          <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={st.cardStatsText}>{item.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListEmpty = () => (
    <View style={st.emptyWrap}>
      {loading ? (
        <ActivityIndicator size="large" color="#E8192C" />
      ) : searched ? (
        <>
          <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={st.emptyText}>Nenhum resultado encontrado</Text>
          <Text style={st.emptySubText}>Tenta outras palavras-chave</Text>
        </>
      ) : (
        <>
          <Ionicons name="musical-notes-outline" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={st.emptyText}>Pesquisa qualquer música</Text>
          <Text style={st.emptySubText}>Usa os atalhos abaixo ou escreve o nome</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Player de resultado ── */}
      <NowPlayingBar
        activeVideo={activeVideo}
        displayTitle={displayTitle}
        displayChannel={displayChannel}
        onEnd={handleVideoEnd}
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={activeVideoIndex !== null && activeVideoIndex > 0}
        canNext={activeVideoIndex !== null && activeVideoIndex < results.length - 1}
      />

      {/* ── Header com barra de pesquisa ── */}
      {!showComments && (
        <View style={[st.header, { paddingTop: activeVideo ? 10 : STATUS_BAR_H + 10 }]}>
          <Text style={st.logo}>Pesquisar</Text>

          {/* Barra de pesquisa */}
          <View style={st.searchBar}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.5)" />
            <TextInput
              ref={inputRef}
              style={st.searchInput}
              placeholder="Pesquisar músicas, artistas..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => doSearch()}
              returnKeyType="search"
              selectionColor="#E8192C"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => doSearch()} style={st.searchBtn}>
              <Text style={st.searchBtnText}>Ir</Text>
            </TouchableOpacity>
          </View>

          {/* Sugestões rápidas */}
          {!searched && (
            <FlatList
              data={QUICK}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(i) => i.id}
              contentContainerStyle={st.quickList}
              renderItem={({ item }) => (
                <TouchableOpacity style={st.quickChip} onPress={() => handleQuick(item.query)}>
                  <Text style={st.quickLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Título da secção */}
          {results.length > 0 && (
            <Text style={st.resultCount}>{results.length} resultados para "{query}"</Text>
          )}
        </View>
      )}

      {/* ── Área inferior: Comentários ou Grelha de resultados ── */}
      <View style={{ flex: 1 }}>
        {showComments && activeVideo ? (
          <CommentsPanel 
            videoId={activeVideo.youtubeId} 
            onClose={() => setShowComments(false)} 
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={st.gridRow}
            contentContainerStyle={st.grid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ListEmpty}
            renderItem={renderCard}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>

      {activeVideo && (
        <ActionBar
          likes={activeVideo?.likes || '0'}
          comments={activeVideo?.comments || '0'}
          shares={activeVideo?.shares || '0'}
          onCommentsPress={() => setShowComments(!showComments)}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08080F',
  },

  /* ── Header ── */
  header: {
    backgroundColor: '#08080F',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
  },

  /* ── Barra de pesquisa ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 0,
  },
  searchBtn: {
    backgroundColor: '#E8192C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ── Sugestões rápidas ── */
  quickList: {
    gap: 8,
    paddingBottom: 4,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(232,25,44,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,25,44,0.3)',
  },
  quickLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  resultCount: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 4,
  },

  /* ── Grelha ── */
  grid: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 120,
  },
  gridRow: {
    gap: 10,
    marginBottom: 10,
  },

  /* ── Card ── */
  card: {
    width: CARD_W,
    backgroundColor: '#161616',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardActive: {
    borderColor: '#E8192C',
    borderWidth: 1.5,
  },
  thumbWrap: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#0a0a0a',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  activeBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  cardInfo: {
    padding: 8,
    gap: 3,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  cardChannel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardStatsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },

  /* ── Estado Vazio ── */
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
});
