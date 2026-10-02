import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const navigation = useNavigation();

  return (
    <View style={st.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.7}>
        <Text style={st.logo}>
          <Text style={{ color: '#fff' }}>S</Text>
          <Text style={{ color: '#E8192C' }}>onder</Text>
        </Text>
      </TouchableOpacity>
      <View style={st.hRow}>
        <TouchableOpacity style={st.hBtn}>
          <Ionicons name="search-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={st.hBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
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
});
