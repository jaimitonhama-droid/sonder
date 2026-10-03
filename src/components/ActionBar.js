import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: W } = Dimensions.get('window');

const CIRCLE  = 210;
const FAB     = 58;
const ICON_R  = 72;
const ICON_S  = 48;
const BAR_H   = 88; // altura total da barra de baixo

const MENU_ITEMS = [
  { icon: 'home',       angle: -Math.PI / 4,     route: 'Home'    },
  { icon: 'search',     angle: -3 * Math.PI / 4, route: 'Search'  },
  { icon: 'chatbubble', angle: 3 * Math.PI / 4,  route: 'Chat'    },
  { icon: 'person',     angle: Math.PI / 4,      route: 'Profile' },
];

export default function ActionBar({ likes = '2.4M', comments = '89.5K', shares = '123K', onCommentsPress }) {
  const [open,  setOpen]  = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const anim     = useRef(new Animated.Value(0)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation();

  /* ── Abrir / fechar menu radial ── */
  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      friction: 6,
      tension: 55,
      useNativeDriver: true,
    }).start();
    setOpen(v => !v);
  };

  /* ── Navegar e fechar menu ── */
  const navigate = (route) => {
    Animated.spring(anim, { toValue: 0, friction: 6, tension: 55, useNativeDriver: true })
      .start(() => { setOpen(false); navigation.navigate(route); });
  };

  /* ── Animação de Like ── */
  const handleLike = () => {
    setLiked(v => !v);
    Animated.sequence([
      Animated.spring(likeAnim, { toValue: 1.5, speed: 60, useNativeDriver: true }),
      Animated.spring(likeAnim, { toValue: 1,   speed: 60, useNativeDriver: true }),
    ]).start();
  };

  /* ── Animação de Guardar ── */
  const handleSave = () => {
    setSaved(v => !v);
    Animated.sequence([
      Animated.spring(saveAnim, { toValue: 1.45, speed: 60, useNativeDriver: true }),
      Animated.spring(saveAnim, { toValue: 1,    speed: 60, useNativeDriver: true }),
    ]).start();
  };

  const fabRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  /* ── Posição do círculo radial (sobe acima da barra) ── */
  const radialBottom = BAR_H + (CIRCLE - FAB) / 2 - 10;

  return (
    <>
      {/* ── Overlay escuro quando menu está aberto ── */}
      {open && (
        <TouchableWithoutFeedback onPress={toggle}>
          <Animated.View style={[st.overlay, { opacity: anim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* ── Círculo do menu radial (flutua acima da barra) ── */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          st.radialWrap,
          {
            bottom: radialBottom,
            left: '50%',
            marginLeft: -CIRCLE / 2,
            transform: [{ scale: anim }],
            opacity: anim,
          },
        ]}
      >
        <View style={st.circleBg}>
          <View style={[st.divLine, { transform: [{ rotate: '45deg'  }] }]} />
          <View style={[st.divLine, { transform: [{ rotate: '-45deg' }] }]} />
        </View>

        {MENU_ITEMS.map((m, i) => {
          const cx = CIRCLE / 2 + ICON_R * Math.cos(m.angle) - ICON_S / 2;
          const cy = CIRCLE / 2 + ICON_R * Math.sin(m.angle) - ICON_S / 2;
          return (
            <TouchableOpacity
              key={i}
              style={[st.mIcon, { left: cx, top: cy }]}
              onPress={() => navigate(m.route)}
              activeOpacity={0.7}
            >
              <Ionicons name={m.icon} size={22} color="rgba(255,255,255,0.92)" />
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* ══════════════════════════════════════════
            BARRA DE ACÇÃO PRINCIPAL (fundo do ecrã)
          ══════════════════════════════════════════ */}
      <View style={st.bar}>

        {/* ─── Lado esquerdo: Like + Comentário ─── */}
        <View style={st.side}>

          {/* Like */}
          <TouchableOpacity style={st.actionBtn} onPress={handleLike} activeOpacity={0.75}>
            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={32}
                color={liked ? '#FF2D55' : '#fff'}
              />
            </Animated.View>
            <Text style={[st.count, liked && { color: '#FF2D55' }]}>{likes}</Text>
          </TouchableOpacity>

          {/* Comentário */}
          <TouchableOpacity style={st.actionBtn} activeOpacity={0.75} onPress={onCommentsPress}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
            <Text style={st.count}>{comments}</Text>
          </TouchableOpacity>

        </View>

        {/* ─── Centro: Botão + (FAB) ─── */}
        <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={st.fabTouch}>
          <Animated.View style={[st.fab, { transform: [{ rotate: fabRotate }] }]}>
            <Ionicons name="add" size={32} color="#fff" />
          </Animated.View>
        </TouchableOpacity>

        {/* ─── Lado direito: Guardar + Partilhar ─── */}
        <View style={st.side}>

          {/* Botão de Shorts */}
          <TouchableOpacity style={st.actionBtn} onPress={() => navigation.navigate('Shorts')} activeOpacity={0.75}>
            <Ionicons name="flash-outline" size={30} color="#fff" />
            <Text style={st.count}>Shorts</Text>
          </TouchableOpacity>

          {/* Partilhar */}
          <TouchableOpacity style={st.actionBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-redo" size={30} color="#fff" />
            <Text style={st.count}>{shares}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </>
  );
}

/* ══════════ ESTILOS ══════════ */
const st = StyleSheet.create({

  /* Overlay */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  /* Círculo radial */
  radialWrap: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
  },
  circleBg: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: 'rgba(12, 12, 20, 0.90)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divLine: {
    position: 'absolute',
    width: CIRCLE - 30,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mIcon: {
    position: 'absolute',
    width: ICON_S,
    height: ICON_S,
    borderRadius: ICON_S / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Barra de acção ── */
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 14,
    backgroundColor: '#0C0C12',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },

  /* Lado esq / dir */
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  /* Cada botão de acção */
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },

  /* Texto de contagem abaixo do ícone */
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.2,
  },

  /* FAB central */
  fabTouch: { zIndex: 10 },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: 'rgba(22, 22, 32, 0.95)',
    borderWidth: 1.8,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});
