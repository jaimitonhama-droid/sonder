import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import eventBus from '../utils/eventBus';

const { width: W } = Dimensions.get('window');

// Cada card tem largura de metade do ecrã menos um gap
const CARD_W = (W - 14 * 2 - 10) / 2; // padding horizontal 14 + gap 10
const CARD_H = CARD_W * (9 / 16);       // ratio 16:9

export default function VideoCard({ video, isActive, onPress }) {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setLocalProgress(0);
      return;
    }
    const unsub = eventBus.on('progress', (p) => {
      setLocalProgress(p);
    });
    return unsub;
  }, [isActive]);

  return (
    <View style={[st.card, isActive && st.cardActive]}>
      {/* Thumbnail */}
      <View style={st.thumbWrap}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
          <Image
            source={{ uri: video.thumbnail }}
            style={st.thumb}
            resizeMode="cover"
          />
          {/* Duração */}
          <View style={st.durBadge}>
            <Text style={st.durTxt}>{video.duration}</Text>
          </View>
          {/* Ícone de Play quando activo */}
          {isActive && (
            <View style={st.activeBadge}>
              <Ionicons name="play-circle" size={28} color="#E8192C" />
            </View>
          )}
        </TouchableOpacity>

        {/* ── Barra de Progresso Interativa ── */}
        {isActive && (
          <Pressable 
            style={st.progressContainer}
            onPress={(e) => {
              if (e.stopPropagation) e.stopPropagation();
              const locX = e.nativeEvent.locationX;
              // Ajusta o facto de termos 8px de padding de cada lado
              const realWidth = CARD_W - 16;
              let p = (locX - 8) / realWidth;
              p = Math.max(0, Math.min(1, p)); // restringe entre 0 e 100%
              
              setLocalProgress(p);
              eventBus.emit('seek', p);
            }}
          >
            <View style={st.progressTrack} pointerEvents="none">
              <View style={[st.progressFill, { width: `${Math.round(localProgress * 100)}%` }]} />
            </View>
          </Pressable>
        )}
      </View>

      {/* Info */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={st.info}>
        <Text style={st.title} numberOfLines={2}>{video.title}</Text>
        <Text style={st.channel} numberOfLines={1}>{video.channel}</Text>
        <Text style={st.views} numberOfLines={1}>{video.views}</Text>
      </TouchableOpacity>
    </View>
  );
}

const st = StyleSheet.create({
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
  durBadge: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durTxt: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  activeBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40, // Área clicável ainda maior
    justifyContent: 'center', // Coloca a linha no MEIO dessa área (levantada do fundo)
    paddingHorizontal: 8, // Um pouco de margem nos lados
    zIndex: 20,
  },
  progressTrack: {
    height: 8, // Ainda mais visível
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#E8192C',
    borderRadius: 4,
  },
  info: {
    padding: 8,
    gap: 2,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  channel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '500',
  },
  views: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
  },
});
