/**
 * NowPlayingBar — Componente isolado que contém o VideoPlayer.
 *
 * A razão de existência deste componente é CRÍTICA para a performance:
 * O `videoProgress` state actualiza a cada 500ms. Se esse state vivesse em
 * HomeScreen, toda a FlatList (e o VideoPlayer dentro do ListHeaderComponent)
 * seria re-renderizada a cada 500ms, causando pausas automáticas.
 *
 * Ao isolar o state aqui, apenas este componente re-renderiza com o progresso.
 * O HomeScreen e a FlatList ficam completamente em paz.
 */
import React, { useState, useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from './VideoPlayer';
import eventBus from '../utils/eventBus';

const { width: W } = Dimensions.get('window');

export default function NowPlayingBar({
  activeVideo,
  displayTitle,
  displayChannel,
  onEnd,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) {
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seekTarget, setSeekTarget] = useState(undefined);

  const handleProgress = useCallback((p) => {
    setProgress(p);
    eventBus.emit('progress', p);
  }, []);

  const handleEnd = useCallback(() => {
    setProgress(0);
    eventBus.emit('progress', 0);
    if (onEnd) onEnd();
  }, [onEnd]);

  React.useEffect(() => {
    const unsub = eventBus.on('seek', (p) => {
      setSeekTarget({ value: p, id: Math.random() });
      setProgress(p);
    });
    return unsub;
  }, []);

  if (!activeVideo) {
    // Ecrã inicial — logo da marca
    return (
      <View style={st.logoWrap}>
        <Image
          source={require('../../assets/logo-cover.jpg')}
          style={{ width: '100%', height: '100%', transform: [{ scale: 1.15 }] }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={st.wrapper}>
      {/* ── Leitor de Vídeo ── */}
      <View style={st.videoWrapper}>
        <VideoPlayer
          key={activeVideo.id}
          videoId={activeVideo.youtubeId}
          onEnd={handleEnd}
          onProgress={handleProgress}
          isMuted={isMuted}
          isPlaying={isPlaying}
          seekTarget={seekTarget}
          onPlayerStateChange={(playing) => setIsPlaying(playing)}
        />
        
        {/* OVERLAY INVISÍVEL PARA CLICAR NO VÍDEO E PAUSAR/TOCAR */}
        <Pressable 
          style={StyleSheet.absoluteFillObject}
          onPress={() => setIsPlaying(prev => !prev)}
        >
          {!isPlaying && (
            <View style={st.pauseOverlay}>
              <View style={st.playCircle}>
                <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Info + Controlos ── */}
      <View style={st.infoRow}>
        <Image source={{ uri: activeVideo.channelAvatar }} style={st.avatar} />
        <View style={st.textWrap}>
          <Text style={st.title} numberOfLines={2}>{displayTitle}</Text>
          <Text style={st.channel} numberOfLines={1}>{displayChannel}</Text>
        </View>
        <View style={st.controls}>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={st.ctrlBtn}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPrev} disabled={!canPrev} style={st.ctrlBtn}>
            <Ionicons name="play-skip-back" size={22} color={canPrev ? '#fff' : 'rgba(255,255,255,0.2)'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} disabled={!canNext} style={st.ctrlBtn}>
            <Ionicons name="play-skip-forward" size={22} color={canNext ? '#fff' : 'rgba(255,255,255,0.2)'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const { height: H } = Dimensions.get('window');
const MAX_H = Platform.OS === 'web' ? Math.min(600, H * 0.5) : 500;

const st = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000',
  },
  videoWrapper: {
    position: 'relative',
    width: Platform.OS === 'web' ? '100%' : W,
    height: Platform.OS === 'web' ? undefined : W * (9 / 16),
    aspectRatio: Platform.OS === 'web' ? 16 / 9 : undefined,
    maxHeight: MAX_H,
    maxWidth: Platform.OS === 'web' ? 1066 : undefined,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoWrap: {
    width: Platform.OS === 'web' ? '100%' : W,
    height: Platform.OS === 'web' ? undefined : W * (9 / 16),
    aspectRatio: Platform.OS === 'web' ? 16 / 9 : undefined,
    maxHeight: MAX_H,
    maxWidth: Platform.OS === 'web' ? 1066 : undefined,
    backgroundColor: '#000',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30, // Área clicável maior
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  mainProgressTrack: {
    height: 6, // Linha mais grossa e visível
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  mainProgressFill: {
    height: 6,
    backgroundColor: '#E8192C',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#101015',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E8192C',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  channel: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 8,
  },
  ctrlBtn: {
    padding: 6,
  },
});
