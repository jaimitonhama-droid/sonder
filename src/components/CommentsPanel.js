import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchVideoComments } from '../services/youtubeApi';

export default function CommentsPanel({ videoId, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadComments() {
      setLoading(true);
      const data = await fetchVideoComments(videoId);
      if (isMounted) {
        setComments(data);
        setLoading(false);
      }
    }
    if (videoId) {
      loadComments();
    }
    return () => { isMounted = false; };
  }, [videoId]);

  return (
    <View style={st.container}>
      <View style={st.header}>
        <Text style={st.title}>Comentários {comments.length > 0 ? `(${comments.length})` : ''}</Text>
        <TouchableOpacity onPress={onClose} style={st.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={st.center}>
          <ActivityIndicator size="large" color="#E8192C" />
        </View>
      ) : comments.length === 0 ? (
        <View style={st.center}>
          <Text style={st.emptyText}>Sem comentários ou desativados.</Text>
        </View>
      ) : (
        <ScrollView style={st.list} contentContainerStyle={{ paddingBottom: 120 }}>
          {comments.map((c, i) => (
            <View key={i} style={st.commentItem}>
              {c.avatar ? (
                <Image source={{ uri: c.avatar }} style={st.avatarImage} />
              ) : (
                <View style={st.avatar}>
                  <Text style={st.avatarText}>{c.author.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={st.content}>
                <View style={st.authorRow}>
                  <Text style={st.userText}>@{c.author.replace('@', '')}</Text>
                  <Text style={st.timeText}>{c.time}</Text>
                </View>
                <Text style={st.commentText}>{c.text}</Text>
                <View style={st.likeRow}>
                  <Ionicons name="heart-outline" size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={st.likeText}>{c.likes}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
  },
  avatarImage: {
    width: 36, height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatar: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#E8192C',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
  content: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12, fontWeight: '700',
  },
  timeText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
  commentText: {
    color: '#fff', fontSize: 13, lineHeight: 18,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  likeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  }
});
