import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Share2, Calendar, Gift, Users, MessageCircle, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockGiveaways } from '@/data/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface ChatMessage {
  id: number;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
}

export default function GiveawayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: 'sarah_j',
      avatar: 'https://i.pravatar.cc/150?img=1',
      message: 'This giveaway looks amazing! How do we participate?',
      timestamp: '2:30 PM'
    },
    {
      id: 2,
      username: 'mike_tech',
      avatar: 'https://i.pravatar.cc/150?img=2',
      message: 'Already joined! Hope I win those tickets!',
      timestamp: '2:32 PM'
    },
    {
      id: 3,
      username: 'EventHub',
      avatar: 'https://i.pravatar.cc/150?img=3',
      message: 'To participate, just hit the Join button and complete the challenge!',
      timestamp: '2:35 PM'
    }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Find the giveaway with matching ID
  const giveaway = mockGiveaways.find(g => g.id === Number(id));
  
  if (!giveaway) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Giveaway not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const handleShare = async () => {
    // Platform share logic
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      username: 'me',
      avatar: 'https://i.pravatar.cc/150?img=4',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const handleJoin = () => {
    setJoined(true);
  };
  
  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.chatMessage,
      item.username === 'me' ? styles.myMessage : null
    ]}>
      {item.username !== 'me' && (
        <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
      )}
      <View style={[
        styles.chatBubble,
        item.username === 'me' 
          ? [styles.myBubble, { backgroundColor: colors.primary }] 
          : [styles.otherBubble, { backgroundColor: colors.card, borderColor: colors.border }]
      ]}>
        {item.username !== 'me' && (
          <Text style={[styles.chatUsername, { color: colors.primary }]}>
            {item.username}
          </Text>
        )}
        <Text style={[
          styles.chatText,
          { color: item.username === 'me' ? 'white' : colors.text }
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.chatTimestamp,
          { color: item.username === 'me' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
        ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: giveaway.imageUrl }} style={styles.headerImage} />
          
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background + '80' }]}
              onPress={() => router.back()}
            >
              <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background + '80' }]}
              onPress={handleShare}
            >
              <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <Share2 size={24} color={colors.text} />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{giveaway.category}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Animated.Text 
            entering={FadeInDown.delay(100).springify()}
            style={[styles.title, { color: colors.text }]}
          >
            {giveaway.title}
          </Animated.Text>
          
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={[styles.hostTag, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.hostText, { color: colors.textSecondary }]}>
              Hosted by <Text style={{ color: colors.primary }}>{giveaway.host}</Text>
            </Text>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={styles.infoContainer}
          >
            <View style={styles.infoItem}>
              <Gift size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Prize: {giveaway.prize}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Ends: {giveaway.endDate}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {giveaway.participants} participants
              </Text>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Giveaway</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {giveaway.description}
            </Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Participate</Text>
            <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.ruleText, { color: colors.text }]}>
                1. Join the giveaway by tapping the Join button below
              </Text>
              <Text style={[styles.ruleText, { color: colors.text }]}>
                2. Follow @{giveaway.host} on social media
              </Text>
              <Text style={[styles.ruleText, { color: colors.text }]}>
                3. Tag 3 friends in the comments below
              </Text>
              <Text style={[styles.ruleText, { color: colors.text }]}>
                4. Share this giveaway on your social media
              </Text>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <View style={styles.chatHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Comments</Text>
              <View style={[styles.chatCount, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.chatCountText, { color: colors.primary }]}>
                  {messages.length}
                </Text>
              </View>
            </View>
            
            <View style={[styles.chatContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <FlatList
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.chatList}
                scrollEnabled={false} // Let parent ScrollView handle scrolling
              />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {joined ? (
          <View style={styles.messageInputContainer}>
            <View style={[styles.messageInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSendMessage}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
            onPress={handleJoin}
          >
            <Text style={styles.joinButtonText}>Join Giveaway</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SF-Pro-Display-Bold',
    marginBottom: 12,
  },
  hostTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  hostText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  rulesCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  ruleText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
    marginBottom: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatCount: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chatCountText: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
  },
  chatContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  chatList: {
    
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  otherBubble: {
    borderTopLeftRadius: 4,
  },
  myBubble: {
    borderTopRightRadius: 4,
    borderWidth: 0,
  },
  chatUsername: {
    fontSize: 12,
    fontFamily: 'SF-Pro-Text-Medium',
    marginBottom: 4,
  },
  chatText: {
    fontSize: 14,
    fontFamily: 'SF-Pro-Text-Regular',
  },
  chatTimestamp: {
    fontSize: 10,
    fontFamily: 'SF-Pro-Text-Regular',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  joinButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Bold',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'SF-Pro-Text-Medium',
    textAlign: 'center',
    marginTop: 20,
  },
  backLink: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Text-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
});