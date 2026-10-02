import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width: W } = Dimensions.get('window');

const STATS = [
  { label: 'Vídeos', value: '48' },
  { label: 'Seguidores', value: '12.4K' },
  { label: 'Seguindo', value: '230' },
];

const MY_VIDEOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&q=80',
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=300&q=80',
];

const THUMB_SIZE = (W - 52) / 3;

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('videos');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("A instalação directa não está disponível. Pode tentar instalar pelo menu do seu navegador (Adicionar ao Ecrã Inicial) ou o app já pode estar instalado.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <View style={st.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(10,10,20,1)', 'rgba(5,5,15,0.97)']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* Top bar */}
        <View style={st.topBar}>
          <Text style={st.handle}>@lena.explores</Text>
          <TouchableOpacity style={st.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Avatar & Info */}
        <View style={st.profileSection}>
          <View style={st.avatarWrap}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={st.avatar}
            />
            <View style={st.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#4FC3F7" />
            </View>
          </View>
          <Text style={st.displayName}>Lena Explores</Text>
          <Text style={st.bio}>Exploradora 🌍 | Fotógrafa | Amante da natureza{'\n'}📍 Lisboa, Portugal</Text>
        </View>

        {/* Stats */}
        <View style={st.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={st.statItem}>
              <Text style={st.statValue}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit Profile Button */}
        <View style={st.actionRow}>
          <TouchableOpacity style={st.editBtn} activeOpacity={0.8}>
            <Text style={st.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.installBtn} activeOpacity={0.8} onPress={handleInstallClick}>
            <Ionicons name="download-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={st.installBtnText}>Instalar Sonder</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={st.tabs}>
          <TouchableOpacity
            style={[st.tab, activeTab === 'videos' && st.tabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color={activeTab === 'videos' ? '#fff' : 'rgba(255,255,255,0.35)'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.tab, activeTab === 'liked' && st.tabActive]}
            onPress={() => setActiveTab('liked')}
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={activeTab === 'liked' ? '#fff' : 'rgba(255,255,255,0.35)'}
            />
          </TouchableOpacity>
        </View>

        {/* Video Grid */}
        <View style={st.grid}>
          {MY_VIDEOS.map((uri, i) => (
            <TouchableOpacity key={i} style={[st.thumb, { width: THUMB_SIZE, height: THUMB_SIZE * 1.35 }]} activeOpacity={0.8}>
              <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={[StyleSheet.absoluteFillObject, { top: '50%' }]}
              />
              <View style={st.thumbViews}>
                <Ionicons name="play" size={10} color="#fff" />
                <Text style={st.thumbViewsText}>
                  {['2.4M', '1.8M', '980K', '3.1M', '450K', '1.2M'][i]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08080F' },
  scroll: { paddingBottom: 20 },

  topBar: {
    paddingTop: 60,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  handle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },

  profileSection: { alignItems: 'center', paddingHorizontal: 20, gap: 10 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
  },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#08080F',
    borderRadius: 12, padding: 1,
  },
  displayName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bio: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 18,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginBottom: 24,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  installBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#E8192C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  installBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 2,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#fff' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    paddingHorizontal: 14,
    paddingTop: 3,
  },
  thumb: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  thumbViews: {
    position: 'absolute', bottom: 6, left: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  thumbViewsText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
