import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Filter, Search, MapPin } from 'lucide-react-native';
import { mockFeaturedEvents, mockCategories } from '@/data/mockData';
import EventCard from '@/components/events/EventCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import SafeLayoutWrapper from '@/components/layout/SafeLayoutWrapper';

export default function EventsScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState('New York, NY');
  
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
  
  const renderEvent = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(100 * index).springify()}
      style={{ marginBottom: 16 }}
    >
      <EventCard event={item} />
    </Animated.View>
  );
  
  const filteredEvents = mockFeaturedEvents.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeLayoutWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Discover Events</Text>
          <TouchableOpacity style={styles.locationContainer}>
            <MapPin size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{location}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Calendar size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for events..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={mockCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      </View>
      
      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
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
              No events found. Try adjusting your search.
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  eventsList: {
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