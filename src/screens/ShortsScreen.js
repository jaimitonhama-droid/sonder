import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../components/VideoPlayer';
import { fetchShorts } from '../services/youtubeApi';

const { width: W, height: H } = Dimensions.get('window');

export default function ShortsScreen({ navigation }) {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const queries = ['music shorts', 'viral shorts', 'trending music shorts', 'funny shorts', 'danca shorts', 'hip hop shorts'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const data = await fetchShorts(randomQuery);
      setShorts(data);
      setLoading(false);
    }
    load();
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }) => {
    const isPlaying = index === currentIndex;
    return (
      <View style={st.shortContainer}>
        {isPlaying ? (
          <VideoPlayer
            videoId={item.youtubeId}
            isPlaying={true}
            isMuted={false}
          />
        ) : (
           <View style={st.placeholder} />
        )}
        <View style={st.overlay}>
          <Text style={st.title} numberOfLines={2}>{item.title}</Text>
          <Text style={st.channel}>@{item.channel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={st.root}>
      <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-down" size={32} color="#fff" />
      </TouchableOpacity>
      {loading ? (
        <View style={st.loading}><ActivityIndicator color="#E8192C" size="large" /></View>
      ) : (
        <FlatList
          data={shorts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  shortContainer: { width: W, height: H, backgroundColor: '#000', justifyContent: 'center' },
  placeholder: { flex: 1, backgroundColor: '#111' },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 100, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { position: 'absolute', bottom: 100, left: 20, right: 80, zIndex: 50 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 10 },
  channel: { color: '#fff', opacity: 0.9, marginTop: 4, textShadowColor: '#000', textShadowRadius: 10 },
});
