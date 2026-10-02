import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// Cores iguais ao MYRO
const RED   = '#E8192C';  // vermelho activo
const DARK  = '#1A1A1A';  // fundo dos botões inactivos
const WHITE = '#FFFFFF';

export default function CategoryFilter({ categories, activeId, onSelect }) {
  return (
    <View style={st.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.scroll}
        bounces={false}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[st.pill, isActive && st.pillActive]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.75}
            >
              <Text style={[st.label, isActive && st.labelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrapper: {
    height: 48,
    backgroundColor: 'transparent',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  pill: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  label: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  labelActive: {
    color: WHITE,
  },
});
