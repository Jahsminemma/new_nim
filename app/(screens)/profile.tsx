import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { Settings, Calendar, Gift, Users, ArrowLeft, Camera, Image as ImageIcon, X, Wallet } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { mockFeaturedEvents, mockGiveaways } from '@/data/mockData';
import EventCard from '@/components/events/EventCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGetProfileQuery, useUploadProfilePictureMutation, useGetFollowingsQuery } from '@/redux/slice/userApiSlice';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";

const tabs = [
  { id: 'events', label: 'My Events', icon: Calendar },
  { id: 'giveaways', label: 'My Giveaways', icon: Gift },
  { id: 'following', label: 'Following', icon: Users },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [refreshing, setRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: profileData, isLoading, refetch, error } = useGetProfileQuery({});
  const [uploadProfilePicture] = useUploadProfilePictureMutation();
  const { data: followingsData, error: isErr } = useGetFollowingsQuery({});


  const handleImageUpdate = async (type: 'camera' | 'library') => {
    try {
      setIsUploading(true);
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera permission to update profile picture');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images.toLocaleLowerCase() as ImagePicker.MediaTypeOptions,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant photo library permission to update profile picture');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images.toLocaleLowerCase() as ImagePicker.MediaTypeOptions,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0].uri) {
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 300 } }],
          {
            compress: 0.7,
          }
        );

        await uploadProfilePicture(manipResult.uri).unwrap();
        setImageKey(Date.now());
        await refetch();
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
      setShowImageModal(false);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  const renderTabBar = () => (
    <View style={[styles.tabBar, { borderColor: colors.border }]}>
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <TabIcon 
              size={18} 
              color={isActive ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: isActive ? colors.primary : colors.textSecondary }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <FlatList
            data={mockFeaturedEvents.slice(0, 3)}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(100 * index).springify()}
                style={{ marginBottom: 16 }}
              >
                <EventCard event={item} />
              </Animated.View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
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
                  You haven't created any events yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create Event</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'giveaways':
        return (
          <FlatList
            data={mockGiveaways.slice(0, 2)}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(100 * index).springify()}
                style={styles.giveawayItem}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.giveawayImage} />
                <View style={styles.giveawayContent}>
                  <Text style={[styles.giveawayTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.giveawayMeta, { color: colors.textSecondary }]}>
                    {item.participants} participants
                  </Text>
                  <View style={[styles.giveawayStatus, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.giveawayStatusText, { color: colors.primary }]}>
                      Active
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
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
                  You haven't created any giveaways yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create Giveaway</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'following':
        return (
          <FlatList
            data={followingsData?.data || []}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(screens)/userProfile', params: { userId: item.userId } })}
                activeOpacity={0.8}
              >
                <Animated.View 
                  entering={FadeInDown.delay(100 * index).springify()}
                  style={[styles.userItem, { borderBottomColor: colors.border }]}
                >
                  <Image 
                    source={{ 
                      uri: item.photo_url || 'https://ui-avatars.com/api/?background=random&color=fff&name=' + encodeURIComponent(item.firstName + ' ' + item.lastName)
                    }} 
                    style={styles.userAvatar} 
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}> 
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={[styles.userUsername, { color: colors.textSecondary }]}> 
                      @{item.userName}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.followButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.followButtonText}>Following</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.contentList}
            showsVerticalScrollIndicator={false}
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
                  You are not following anyone yet.
                </Text>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.createButtonText}>Explore Users</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        
        <View style={styles.headerButtons}>
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/wallet')}
            >
              <Wallet size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerButtonLabel, { color: colors.textSecondary }]}>Wallet</Text>
          </View>
          
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(screens)/settings')}
            >
              <Settings size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerButtonLabel, { color: colors.textSecondary }]}>Settings</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowImageModal(true)}
            disabled={isUploading}
          >
            <Image 
              key={imageKey}
              source={{ 
                uri: profileData?.data?.photo_url 
                  ? `${profileData.data.photo_url}?t=${imageKey}` 
                  : 'https://ui-avatars.com/api/?background=random&color=fff&name=' + encodeURIComponent(profileData?.data?.firstName + ' ' + profileData?.data?.lastName)
              }}
              style={styles.avatar}
            />
            {isUploading ? (
              <View style={[styles.uploadingOverlay, { backgroundColor: colors.primary + '80' }]}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : (
              <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
                <Camera size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {profileData?.data?.firstName} {profileData?.data?.lastName}
            </Text>
            <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
              @{profileData?.data?.userName}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {profileData?.data?.hostedGiveaways?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Giveaways</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {profileData?.data?.hostedEvents?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Events</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {profileData?.data?.giveawayWins || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wins</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {profileData?.data?.followers?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.editProfileButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {renderTabBar()}
      {renderContent()}

      {/* Image Update Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Update Profile Picture</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => handleImageUpdate('camera')}
            >
              <Camera size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => handleImageUpdate('library')}
            >
              <ImageIcon size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButtonContainer: {
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  contentList: {
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
    marginBottom: 16,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  giveawayItem: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  giveawayImage: {
    width: 100,
    height: 100,
  },
  giveawayContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  giveawayTitle: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 4,
  },
  giveawayMeta: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 8,
  },
  giveawayStatus: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  giveawayStatusText: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  userUsername: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  headerButtonLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
});