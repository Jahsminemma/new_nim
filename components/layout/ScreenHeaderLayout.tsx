import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

const ScreenHeaderLayout = ({
  headerTitle,
  children,
}: {
  headerTitle: string;
  children: ReactNode;
}) => {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {headerTitle}
        </Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default ScreenHeaderLayout;
