import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const themePresets = [
  {
    id: 'default',
    name: 'Coral',
    colors: {
      primary: '#ff6456',
      secondary: '#00BCD4',
      accent: '#FFD700',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#2196F3',
      secondary: '#4CAF50',
      accent: '#FFC107',
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#FF9800',
      secondary: '#E91E63',
      accent: '#9C27B0',
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#4CAF50',
      secondary: '#8BC34A',
      accent: '#CDDC39',
    }
  },
];

export default function ThemeSettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode, activeTheme, setActiveTheme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Theme Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Mode</Text>
          
          {['system', 'light', 'dark'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.option,
                { borderBottomColor: colors.border },
                themeMode === mode && { backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setThemeMode(mode as 'system' | 'light' | 'dark')}
            >
              <Text style={[
                styles.optionTitle,
                { color: themeMode === mode ? colors.primary : colors.text }
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
              {themeMode === mode && (
                <ChevronRight size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Theme</Text>
          
          {themePresets.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.option,
                { borderBottomColor: colors.border },
                activeTheme === theme.id && { backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setActiveTheme(theme.id)}
            >
              <View style={styles.themePresetInfo}>
                <View style={styles.colorPreviews}>
                  {Object.values(theme.colors).map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorPreview, { backgroundColor: color }]}
                    />
                  ))}
                </View>
                <Text style={[
                  styles.optionTitle,
                  { color: activeTheme === theme.id ? colors.primary : colors.text }
                ]}>
                  {theme.name}
                </Text>
              </View>
              {activeTheme === theme.id && (
                <ChevronRight size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    padding: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  themePresetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreviews: {
    flexDirection: 'row',
    marginRight: 12,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
});