import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import AuthScreen from './AuthScreen';
import BookApp from './bookApp';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <AuthScreen onAuthSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BookApp />
    </SafeAreaView>
  );
}
