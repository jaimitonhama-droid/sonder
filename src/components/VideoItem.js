import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ActionBar from './ActionBar';
import Header from './Header';

const { width: W, height: H } = Dimensions.get('window');

export default function VideoItem({ item, isActive }) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const thumbnailOpacity = useRef(new Animated.Value(1)).current;

  // Quando o YouTube player estiver pronto, faz fade da thumbnail para o vídeo
  const onReady = useCallback(() => {
    setReady(true);
    setPlaying(true);
    Animated.timing(thumbnailOpacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [thumbnailOpacity]);

  // Se o utilizador pausar manualmente, mostramos a thumbnail novamente para esconder a UI do YouTube
  const togglePlay = () => {
    const nextState = !playing;
    setPlaying(nextState);
    if (!nextState) {
      // Pausado: mostra a thumbnail imediatamente para tapar a UI do YT
      Animated.timing(thumbnailOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // A reproduzir: esconde a thumbnail
      Animated.timing(thumbnailOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Pausa quando o utilizador sai deste vídeo
  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={st.container}>
      <StatusBar style="light" translucent />

      {/* ── YouTube Player (fundo) ── */}
      <View style={st.playerWrap}>
        {/* Aumentamos a escala para 1.25 para cortar agressivamente as bordas (Top/Bottom) onde o YouTube mete logótipos */}
        <View style={{ transform: [{ scale: 1.25 }], width: W, height: H }}>
          {Platform.OS === 'web' && (
            <iframe
              src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=${isActive && playing ? 1 : 0}&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media"
              onLoad={onReady}
            />
          )}
        </View>
        
        {/* ESCUDO (DEFESA): Uma camada invisível que bloqueia o acesso à iframe do YouTube */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
          onPress={togglePlay}
        />
      </View>

      {/* ── Thumbnail (aparece enquanto o vídeo carrega ou quando está pausado) ── */}
      <Animated.View style={[st.thumbnailWrap, { opacity: thumbnailOpacity }]} pointerEvents="none">
        <Image source={{ uri: item.thumbnail }} style={st.thumbnail} resizeMode="cover" />
        
        {/* Ícone de Play customizado quando pausado (e já carregado) */}
        {ready && !playing && (
          <View style={st.customPlayOverlay}>
            <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Loading Spinner */}
        {!ready && (
          <View style={st.loadingOverlay}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </Animated.View>

      {/* ── Gradiente escuro (legibilidade do texto) ── */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
        style={st.gradient}
        locations={[0, 0.15, 0.55, 0.80, 1]}
      />

      {/* ── Conteúdo sobreposto ── */}
      <SafeAreaView style={st.overlay} pointerEvents="box-none">

        {/* Cabeçalho */}
        <Header />

        <View style={{ flex: 1 }} />

        {/* Informação do criador */}
        <View style={st.info}>
          {/* Linha do avatar + nome */}
          <View style={st.pRow}>
            <Image source={{ uri: item.user.avatar }} style={st.avatar} />
            <Text style={st.uname}>{item.user.name}</Text>
            {item.user.verified && (
              <MaterialCommunityIcons
                name="check-decagram" size={16} color="#4FC3F7"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          {/* Descrição */}
          <Text style={st.desc} numberOfLines={3}>
            {item.description}{'  '}
            <Text style={st.more}>ver mais</Text>
          </Text>

          {/* Música */}
          <View style={st.mRow}>
            <Ionicons name="musical-note" size={13} color="#fff" />
            <Text style={st.mTxt} numberOfLines={1}>{item.music}</Text>
          </View>
        </View>

        {/* Espaço para a ActionBar */}
        <View style={{ height: 96 }} />
      </SafeAreaView>

      {/* ── Barra de acções (Like, Comentários, FAB, Guardar, Partilhar) ── */}
      <ActionBar
        likes={item.likes}
        comments={item.comments}
        shares={item.shares}
      />
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    width: W,
    height: H,
    backgroundColor: '#000',
  },

  /* Player YouTube */
  playerWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  webView: {
    opacity: 0.99, // fix ecrã preto no Android
    backgroundColor: 'transparent',
  },

  /* Thumbnail de loading */
  thumbnailWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnail: {
    width: W,
    height: H,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Gradiente */
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  /* Overlay com conteúdo */
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  /* Informação do criador */
  info: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 9,
  },
  pRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  uname: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  desc: {
    color: '#eee',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  more: {
    color: '#fff',
    fontWeight: '700',
  },
  mRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mTxt: {
    color: '#eee',
    fontSize: 13,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
