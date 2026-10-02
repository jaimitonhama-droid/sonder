import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const CONVERSATIONS = [
  {
    id: '1',
    name: 'Lena Explores',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMsg: 'Que vídeo incrível! 🔥',
    time: '2m',
    unread: 3,
    online: true,
  },
  {
    id: '2',
    name: 'Arctic Soul',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMsg: 'Obrigado pelo like! 🙏',
    time: '15m',
    unread: 0,
    online: true,
  },
  {
    id: '3',
    name: 'Ocean Deep',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMsg: 'Seguiste-me! Vou seguir de volta',
    time: '1h',
    unread: 1,
    online: false,
  },
  {
    id: '4',
    name: 'Sand Dunes',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    lastMsg: 'Boa viagem! 🌄',
    time: '3h',
    unread: 0,
    online: false,
  },
];

export default function ChatScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={st.row} activeOpacity={0.75}>
      <View style={st.avatarWrap}>
        <Image source={{ uri: item.avatar }} style={st.avatar} />
        {item.online && <View style={st.onlineDot} />}
      </View>
      <View style={st.info}>
        <View style={st.topRow}>
          <Text style={st.name}>{item.name}</Text>
          <Text style={st.time}>{item.time}</Text>
        </View>
        <View style={st.bottomRow}>
          <Text style={[st.lastMsg, item.unread > 0 && st.lastMsgBold]} numberOfLines={1}>
            {item.lastMsg}
          </Text>
          {item.unread > 0 && (
            <View style={st.badge}>
              <Text style={st.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={st.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(10,10,20,1)', 'rgba(5,5,15,0.97)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={st.header}>
        <View>
          <Text style={st.title}>Mensagens</Text>
          <Text style={st.subtitle}>4 conversas activas</Text>
        </View>
        <TouchableOpacity style={st.newBtn}>
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de conversas */}
      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={st.list}
        ItemSeparatorComponent={() => <View style={st.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={st.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color="rgba(255,255,255,0.15)" />
            <Text style={st.emptyText}>Sem mensagens ainda</Text>
          </View>
        }
      />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08080F' },

  header: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 3,
  },
  newBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { paddingHorizontal: 18, paddingBottom: 120 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#08080F',
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  lastMsgBold: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 68,
  },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.25)', fontSize: 15 },
});
