import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchShorts } from '../services/youtubeApi';

const { width: W, height: H } = Dimensions.get('window');

// Componente isolado para cada Short — só monta o iframe quando está activo
function ShortItem({ item, isActive }) {
  const iframeRef = useRef(null);

  // Quando o item fica inactivo, envia pauseVideo ao iframe sem o destruir
  useEffect(() => {
    if (!iframeRef.current || Platform.OS !== 'web') return;
    const func = isActive ? 'playVideo' : 'pauseVideo';
    // Pequeno delay para o iframe estar pronto
    const t = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func }),
          '*'
        );
      }
    }, 300);
    return () => clearTimeout(t);
  }, [isActive]);

  return (
    <View style={st.shortContainer}>
      {/* Iframe sempre presente — só pausamos/tocamos */}
      <View style={st.playerWrap}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=${isActive ? 1 : 0}&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&enablejsapi=1&playsinline=1`}
            style={{
              width: '150%',
              height: '150%',
              border: 'none',
              marginLeft: '-25%',
              marginTop: '-25%',
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            title="Short"
          />
        ) : null}
      </View>

      {/* Overlay com título e canal */}
      <View style={st.overlay}>
        <View style={st.infoRow}>
          <Text style={st.title} numberOfLines={2}>{item.title}</Text>
          <Text style={st.channel}>@{item.channel}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ShortsScreen({ navigation }) {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const queries = [
        'music shorts', 'viral shorts', 'trending music shorts',
        'comedy shorts', 'dance challenge', 'hip hop shorts',
        'afrobeats shorts', 'funny moments shorts',
      ];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const data = await fetchShorts(randomQuery);
      setShorts(data);
      setLoading(false);
    }
    load();
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <ShortItem key={item.id} item={item} isActive={index === currentIndex} />
  ), [currentIndex]);

  return (
    <View style={st.root}>
      {/* Botão de fechar */}
      <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-down" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Label "Shorts" */}
      <View style={st.header}>
        <Ionicons name="flash" size={18} color="#E8192C" />
        <Text style={st.headerText}>Shorts</Text>
      </View>

      {loading ? (
        <View style={st.loading}>
          <ActivityIndicator color="#E8192C" size="large" />
        </View>
      ) : (
        <FlatList
          data={shorts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({ length: H, offset: H * index, index })}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  shortContainer: {
    width: W,
    height: H,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  playerWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingBottom: 80,
    paddingHorizontal: 20,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0)', // fallback
  },
  infoRow: { gap: 4 },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    lineHeight: 22,
  },
  channel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 6,
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 200,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 100,
  },
  headerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
