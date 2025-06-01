import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { Filter, Search } from 'lucide-react-native';
import { mockGiveaways, mockGiveawayCategories } from '@/data/mockData';
import GiveawayListItem from '@/components/giveaways/GiveawayListItem';
import Animated, { FadeInDown } from 'react-native-reanimated';
import SafeLayoutWrapper from '@/components/layout/SafeLayoutWrapper';

export default function GiveawaysScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const renderCategory = ({ item, index }: { item: string, index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 * index).springify()}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === item && { backgroundColor: colors.primary },
          { borderColor: colors.border }
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        <Text
          style={[
            styles.categoryText,
            { color: selectedCategory === item ? 'white' : colors.text }
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  const renderGiveaway = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(100 * index).springify()}
      style={{ marginBottom: 16 }}
    >
      <GiveawayListItem giveaway={item} />
    </Animated.View>
  );
  
  const filteredGiveaways = mockGiveaways.filter(giveaway => {
    const matchesSearch = searchQuery === '' || 
      giveaway.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      giveaway.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || giveaway.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeLayoutWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Giveaways</Text>
        
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Filter size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for giveaways..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={mockGiveawayCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      </View>
      
      <FlatList
        data={filteredGiveaways}
        renderItem={renderGiveaway}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.giveawaysList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No giveaways found. Try adjusting your search.
            </Text>
          </View>
        }
      />
    </SafeLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'SF-Pro-Text-Regular',
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'SF-Pro-Text-Medium',
    fontSize: 14,
  },
  giveawaysList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'SF-Pro-Text-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
});