import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Brand } from '@/constants/theme';
import { LanguageProvider } from '@/constants/i18n';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash after a brief delay for smooth transition
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Brand.cardDark },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Brand.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercises"
            options={{
              title: 'Exercises',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="meals"
            options={{
              title: 'Meal Plan',
              presentation: 'card',
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
