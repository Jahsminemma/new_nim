import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Platform, Alert, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Camera, Calendar as CalendarIcon, Clock, MapPin, Ticket, Info, Gift, CirclePlus as PlusCircle, X, Search, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import CoinSelector from '@/components/giveaways/CoinSelector';
import SafeLayoutWrapper from '@/components/layout/SafeLayoutWrapper';

type CreationType = 'event' | 'giveaway';
type GameType = 'trivia' | 'wordguess' | 'social' | 'number';
type EligibilityType = 'all' | 'followers' | 'specific';

interface SelectedUser {
  id: string;
  name: string;
  avatar: string;
}

export default function CreateScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [creationType, setCreationType] = useState<CreationType>('event');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [prize, setPrize] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);
  
  // Giveaway specific states
  const [gameType, setGameType] = useState<GameType>('trivia');
  const [eligibility, setEligibility] = useState<EligibilityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [numberOfWinners, setNumberOfWinners] = useState('1');
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Mock users for search
  const mockUsers = [
    { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=4' },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedUsers.find(selected => selected.id === user.id)
  );
  
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Sorry, we need camera roll permissions to select an image.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCreateSubmit = () => {
    router.push('/(tabs)/');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderGameTypeOption = (type: GameType, label: string) => (
    <TouchableOpacity
      style={[
        styles.gameTypeOption,
        gameType === type && { backgroundColor: colors.primary },
        { borderColor: colors.border }
      ]}
      onPress={() => setGameType(type)}
    >
      <Text style={[
        styles.gameTypeText,
        { color: gameType === type ? 'white' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEligibilityOption = (type: EligibilityType, label: string) => (
    <TouchableOpacity
      style={[
        styles.eligibilityOption,
        eligibility === type && { backgroundColor: colors.primary },
        { borderColor: colors.border }
      ]}
      onPress={() => {
        setEligibility(type);
        if (type === 'specific') {
          setShowUserSearch(true);
        } else {
          setShowUserSearch(false);
          setSelectedUsers([]);
        }
      }}
    >
      <Text style={[
        styles.eligibilityText,
        { color: eligibility === type ? 'white' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderUserSearchSection = () => (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      style={styles.userSearchSection}
    >
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Selected Users</Text>
          <FlatList
            data={selectedUsers}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.selectedUserChip, { backgroundColor: colors.primary + '20' }]}>
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                <Text style={[styles.selectedUserName, { color: colors.primary }]}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => setSelectedUsers(prev => prev.filter(user => user.id !== item.id))}
                >
                  <X size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id}
            style={styles.selectedUsersList}
          />
        </View>
      )}

      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userSearchResult, { borderBottomColor: colors.border }]}
            onPress={() => {
              setSelectedUsers(prev => [...prev, item]);
              setSearchQuery('');
            }}
          >
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        style={[styles.searchResults, { backgroundColor: colors.card }]}
      />
    </Animated.View>
  );
  
  return (
    <SafeLayoutWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Create {creationType === 'event' ? 'Event' : 'Giveaway'}
          </Text>
          
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              creationType === 'event' && { backgroundColor: colors.primary },
              { borderColor: colors.border }
            ]}
            onPress={() => setCreationType('event')}
          >
            <Text 
              style={[
                styles.typeButtonText,
                { color: creationType === 'event' ? 'white' : colors.text }
              ]}
            >
              Event
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              creationType === 'giveaway' && { backgroundColor: colors.primary },
              { borderColor: colors.border }
            ]}
            onPress={() => setCreationType('giveaway')}
          >
            <Text 
              style={[
                styles.typeButtonText,
                { color: creationType === 'giveaway' ? 'white' : colors.text }
              ]}
            >
              Giveaway
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.imageSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={pickImage}
        >
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                onPress={() => setImage(null)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={40} color={colors.textSecondary} />
              <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                Add Cover Image
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea, 
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
            ]}
            placeholder="Enter description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>
        
        {creationType === 'event' ? (
          <>
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
                <TouchableOpacity
                  style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <CalendarIcon size={20} color={colors.textSecondary} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
                <TouchableOpacity
                  style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={colors.textSecondary} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MapPin size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  placeholder="Enter location"
                  placeholderTextColor={colors.textSecondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ticket Price</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ticket size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  placeholder="$0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="numeric"
                />
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Prize Amount</Text>
              <TouchableOpacity
                style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowCoinSelector(true)}
              >
                <Gift size={20} color={colors.textSecondary} />
                <Text style={[styles.inputWithIcon, { color: colors.text }]}>
                  {selectedCoins ? `${selectedCoins.toLocaleString()} NIM` : 'Select price'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <CoinSelector
              visible={showCoinSelector}
              onClose={() => setShowCoinSelector(false)}
              onSelect={setSelectedCoins}
            />

            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Game Type</Text>
              <View style={styles.gameTypeContainer}>
                {renderGameTypeOption('trivia', 'Trivia Quiz')}
                {renderGameTypeOption('wordguess', 'Word Guess')}
                {renderGameTypeOption('social', 'Social Challenge')}
                {renderGameTypeOption('number', 'Number Puzzle')}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Participant Eligibility</Text>
              <View style={styles.eligibilityContainer}>
                {renderEligibilityOption('all', 'All Users')}
                {renderEligibilityOption('followers', 'Followers Only')}
                {renderEligibilityOption('specific', 'Specific Users')}
              </View>
            </Animated.View>

            {eligibility === 'specific' && renderUserSearchSection()}

            <Animated.View entering={FadeInDown.delay(600).springify()}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Number of Winners</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Users size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  placeholder="Enter number of winners"
                  placeholderTextColor={colors.textSecondary}
                  value={numberOfWinners}
                  onChangeText={setNumberOfWinners}
                  keyboardType="numeric"
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Start Date</Text>
                <TouchableOpacity
                  style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <CalendarIcon size={20} color={colors.textSecondary} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>End Date</Text>
                <TouchableOpacity
                  style={[styles.iconInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <CalendarIcon size={20} color={colors.textSecondary} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}
        
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateSubmit}
          >
            <Text style={styles.submitButtonText}>
              Create {creationType === 'event' ? 'Event' : 'Giveaway'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setTime(selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </SafeLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  imageSelector: {
    height: 200,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 24,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    marginBottom: 16,
    minHeight: 48,
  },
  inputWithIcon: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: Platform.OS === 'ios' ? 0 : 10,
  },
  pickerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  gameTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  gameTypeOption: {
    width: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    margin: 8,
  },
  gameTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  eligibilityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  eligibilityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    margin: 8,
  },
  eligibilityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  userSearchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  searchResults: {
    borderRadius: 8,
    maxHeight: 200,
  },
  userSearchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  selectedUsersContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  selectedUsersList: {
    marginBottom: 12,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedUserName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginHorizontal: 8,
  },
});