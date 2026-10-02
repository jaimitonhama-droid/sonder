import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <AppNavigator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08080F',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#08080F',
  },
});
