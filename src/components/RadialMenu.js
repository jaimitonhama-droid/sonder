import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: W } = Dimensions.get('window');
const CIRCLE = 210;
const FAB = 60;
const ICON_R = 72;
const ICON_S = 48;

// Cada item tem: ícone, ângulo, rota de navegação e label
const MENU = [
  { icon: 'home',           angle: -Math.PI / 2,  route: 'Home',    label: 'Início'   }, // Topo (em cima no meio)
  { icon: 'chatbubble',     angle: Math.PI / 2,   route: 'Chat',    label: 'Chat'     }, // Baixo (mensagens em baixo no meio)
  { icon: 'search',         angle: Math.PI,       route: 'Search',  label: 'Descobrir' }, // Esquerda (no meio)
  { icon: 'person',         angle: 0,             route: 'Profile', label: 'Perfil'   }, // Direita (no meio)
];

export default function RadialMenu() {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      friction: 6,
      tension: 55,
      useNativeDriver: true,
    }).start();
    setOpen((v) => !v);
  };

  const navigate = (route) => {
    // Fecha o menu com animação e depois navega
    Animated.spring(anim, {
      toValue: 0,
      friction: 6,
      tension: 55,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
      navigation.navigate(route);
    });
  };

  const fabRotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Overlay que fecha o menu ao clicar fora */}
      {open && (
        <TouchableWithoutFeedback onPress={toggle}>
          <Animated.View style={[st.overlay, { opacity: anim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* FAB + Menu Radial */}
      <View style={st.fabArea} pointerEvents="box-none">
        <Animated.View
          style={[st.radial, { transform: [{ scale: anim }], opacity: anim }]}
          pointerEvents={open ? 'auto' : 'none'}
        >
          {/* Círculo de fundo */}
          <View style={st.circleBg}>
            <View style={[st.divLine, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[st.divLine, { transform: [{ rotate: '-45deg' }] }]} />
          </View>

          {/* Botões do menu */}
          {MENU.map((m, i) => {
            const cx = CIRCLE / 2 + ICON_R * Math.cos(m.angle) - ICON_S / 2;
            const cy = CIRCLE / 2 + ICON_R * Math.sin(m.angle) - ICON_S / 2;
            return (
              <TouchableOpacity
                key={i}
                style={[st.mIcon, { left: cx, top: cy }]}
                onPress={() => navigate(m.route)}
                activeOpacity={0.7}
              >
                <Ionicons name={m.icon} size={22} color="rgba(255,255,255,0.90)" />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Botão FAB central */}
        <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={{ zIndex: 10 }}>
          <Animated.View style={[st.fab, { transform: [{ rotate: fabRotate }] }]}>
            <Ionicons name="add" size={30} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const st = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  fabArea: {
    position: 'absolute',
    bottom: 130 - (CIRCLE - FAB) / 2,
    left: (W - CIRCLE) / 2,
    width: CIRCLE,
    height: CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radial: { ...StyleSheet.absoluteFillObject },
  circleBg: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: 'rgba(15, 15, 22, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divLine: {
    position: 'absolute',
    width: CIRCLE - 30,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  mIcon: {
    position: 'absolute',
    width: ICON_S,
    height: ICON_S,
    borderRadius: ICON_S / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: 'rgba(25, 25, 35, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
