import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BrandedSplash } from './src/components/BrandedSplash';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

function AppInner() {
  const [showSplash, setShowSplash] = React.useState(true);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      {showSplash ? (
        <BrandedSplash />
      ) : (
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </View>
      )}
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

export default App;
