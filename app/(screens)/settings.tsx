import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Bell, Lock, Info, FileText, Mail, ChevronRight, ArrowLeft, Palette } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/hooks/useAuth';
import PinUpdateModal from '@/components/settings/PinUpdateModal';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                {isDark ? (
                  <Moon size={22} color={colors.primary} />
                ) : (
                  <Sun size={22} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
            />
          </View>

          <TouchableOpacity 
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/(screens)/theme-settings')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Palette size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Theme Settings</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Bell size={22} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Receive push notifications for important updates
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={pushNotifications ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Mail size={22} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Email Notifications</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Receive email notifications and newsletters
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={emailNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
          
          <TouchableOpacity 
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => setShowPinModal(true)}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Lock size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Update PIN</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          
          <TouchableOpacity 
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenLink('https://example.com/contact')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Mail size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Contact Us</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenLink('https://example.com/terms')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <FileText size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => handleOpenLink('https://example.com/privacy')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '10' }]}>
                <Info size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.error + '20' }]}
          onPress={signOut}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <PinUpdateModal 
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
      />
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
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});