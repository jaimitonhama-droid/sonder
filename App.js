import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

const CIRCLE = 210;
const FAB = 60;
const ICON_R = 72;
const ICON_S = 44;

const VIDEO_DATA = {
  user: {
    name: '@LENA.EXPLORES',
    verified: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  description: 'Sunset hikes in Patagonia! #Travel #Hike #AuraAdventures #Wanderlust #AURA',
  music: '"Golden Hour" - LoFi Trails',
  thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
};

const MENU = [
  { icon: 'home-outline',       lib: 'Ionicons', angle: -Math.PI / 4 },
  { icon: 'search-outline',     lib: 'Ionicons', angle: -3 * Math.PI / 4 },
  { icon: 'chatbubble-outline', lib: 'Ionicons', angle: 3 * Math.PI / 4 },
  { icon: 'person-outline',     lib: 'Ionicons', angle: Math.PI / 4 },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
    setOpen((v) => !v);
  };

  const fabRotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={st.root}>
      <StatusBar style="light" translucent />

      <Image source={{ uri: VIDEO_DATA.thumbnail }} style={st.bg} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.90)']}
        style={st.grad}
      />

      <SafeAreaView style={st.safe}>
        <View style={st.header}>
          <Text style={st.logo}>AURA</Text>
          <View style={st.hRow}>
            <TouchableOpacity style={st.hBtn}>
              <Ionicons name="search-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={st.hBtn}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={st.info}>
          <View style={st.pRow}>
            <Image source={{ uri: VIDEO_DATA.user.avatar }} style={st.avatar} />
            <Text style={st.uname}>{VIDEO_DATA.user.name}</Text>
            {VIDEO_DATA.user.verified && (
              <MaterialCommunityIcons
                name="check-decagram" size={16} color="#4FC3F7"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text style={st.desc} numberOfLines={3}>
            {VIDEO_DATA.description}{'  '}
            <Text style={st.more}>See more</Text>
          </Text>
          <View style={st.mRow}>
            <Ionicons name="musical-note" size={14} color="#fff" />
            <Text style={st.mTxt}>{VIDEO_DATA.music}</Text>
          </View>
        </View>

        <View style={{ height: FAB + 60 }} />
      </SafeAreaView>

      {/* Overlay */}
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
          <View style={st.circleBg}>
            <View style={[st.divLine, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[st.divLine, { transform: [{ rotate: '-45deg' }] }]} />
          </View>

          {MENU.map((m, i) => {
            const cx = CIRCLE / 2 + ICON_R * Math.cos(m.angle) - ICON_S / 2;
            const cy = CIRCLE / 2 + ICON_R * Math.sin(m.angle) - ICON_S / 2;
            return (
              <TouchableOpacity
                key={i}
                style={[st.mIcon, { left: cx, top: cy }]}
                onPress={toggle}
              >
                <Ionicons name={m.icon} size={24} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <TouchableOpacity onPress={toggle} activeOpacity={0.85} style={{ zIndex: 10 }}>
          <Animated.View style={[st.fab, { transform: [{ rotate: fabRotate }] }]}>
            <Ionicons name="add" size={30} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject, width: W, height: H },
  grad: { ...StyleSheet.absoluteFillObject, top: H * 0.38 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50,
  },
  logo: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  hRow: { flexDirection: 'row', gap: 8 },
  hBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  info: { paddingHorizontal: 18, paddingBottom: 14, gap: 10 },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
  uname: { color: '#fff', fontWeight: '700', fontSize: 15 },
  desc: { color: '#eee', fontSize: 14, lineHeight: 20 },
  more: { color: '#fff', fontWeight: '700' },
  mRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mTxt: { color: '#eee', fontSize: 13 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },

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
    backgroundColor: 'rgba(20, 20, 25, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divLine: {
    position: 'absolute',
    width: CIRCLE - 30,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  mIcon: {
    position: 'absolute',
    width: ICON_S,
    height: ICON_S,
    borderRadius: ICON_S / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: 'rgba(25, 25, 30, 0.90)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
