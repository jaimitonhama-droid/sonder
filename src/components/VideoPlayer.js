import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import ReactPlayer from 'react-player';

const { width: windowWidth } = Dimensions.get('window');

export default function VideoPlayer({ videoId, onEnd, onProgress, isMuted, isPlaying, seekTarget, onPlayerStateChange }) {
  const iframeRef = React.useRef(null);
  const durationRef = React.useRef(0);

  // Hook para pausar/tocar via comandos JS
  React.useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const func = isPlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func }),
        '*'
      );
    }
  }, [isPlaying]);

  // Hook para pular (seek) o vídeo
  React.useEffect(() => {
    if (seekTarget && seekTarget.value !== undefined && iframeRef.current && iframeRef.current.contentWindow && durationRef.current) {
      const targetSec = seekTarget.value * durationRef.current;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [targetSec, true] }),
        '*'
      );
    }
  }, [seekTarget]);

  // Hook para ouvir API de mensagens do iframe nativo
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(event.data);
        
        if (data.event === 'infoDelivery' && data.info) {
          // Atualiza a duração interna
          if (data.info.duration) {
            durationRef.current = data.info.duration;
          }
          // Calcula o progresso para a barra
          if (data.info.currentTime !== undefined && durationRef.current) {
            const p = data.info.currentTime / durationRef.current;
            if (onProgress) onProgress(p);
          }
          // Detecta fim do vídeo
          if (data.info.playerState === 0) {
            if (onEnd) onEnd();
          }
          // Sincroniza o estado real do player com o componente pai
          if (data.info.playerState === 1 || data.info.playerState === 2) {
            if (onPlayerStateChange) onPlayerStateChange(data.info.playerState === 1);
          }
        } else if (data.info === 0) {
          if (onEnd) onEnd();
        }
      } catch (e) {
        // Ignora mensagens inválidas
      }
    };

    window.addEventListener('message', handleMessage);

    const handshake = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          'https://www.youtube.com'
        );
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(handshake);
    };
  }, [onEnd, onProgress]);

  const isWeb = Platform.OS === 'web';
  const W = windowWidth;
  const PLAYER_H = W * (9 / 16);
  const SCALE  = 1.50;
  const S_W    = W * SCALE;
  const S_H    = PLAYER_H * SCALE;
  const OFF_X  = -(S_W - W) / 2;
  const OFF_Y  = -(S_H - PLAYER_H) / 2;

  return (
    <View style={[st.container, isWeb && { width: '100%', height: '100%' }]}>
      <View style={st.playerContainer}>
        <View
          style={isWeb ? {
            width: '150%',
            height: '150%',
            transform: [{ translateX: '-16.6666%' }, { translateY: '-16.6666%' }],
            pointerEvents: 'none',
          } : {
            width: S_W,
            height: S_H,
            transform: [{ translateX: OFF_X }, { translateY: OFF_Y }],
            pointerEvents: 'none',
          }}
        >
          {Platform.OS === 'web' && (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&enablejsapi=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              title="YouTube Video"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    width: windowWidth,
    height: windowWidth * (9 / 16),
    backgroundColor: '#000',
    position: 'relative',
  },
  playerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});

