import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreatorInfo({ user, description, music }) {
  return (
    <View style={st.info}>
      <View style={st.pRow}>
        <Image source={{ uri: user.avatar }} style={st.avatar} />
        <Text style={st.uname}>{user.name}</Text>
        {user.verified && (
          <MaterialCommunityIcons
            name="check-decagram" size={16} color="#4FC3F7"
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
      <Text style={st.desc} numberOfLines={3}>
        {description}{'  '}
        <Text style={st.more}>See more</Text>
      </Text>
      <View style={st.mRow}>
        <Ionicons name="musical-note" size={14} color="#fff" />
        <Text style={st.mTxt}>{music}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  info: { paddingHorizontal: 18, paddingBottom: 14, gap: 10 },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
  uname: { color: '#fff', fontWeight: '700', fontSize: 15 },
  desc: { color: '#eee', fontSize: 14, lineHeight: 20 },
  more: { color: '#fff', fontWeight: '700' },
  mRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mTxt: { color: '#eee', fontSize: 13 },
});
