import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useTheme } from '@/hooks/useTheme';
import { PhoneCall as PhoneCallIcon, X, Search, CircleUser as UserCircle2Icon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Contact {
  id?: string;
  name: string;
  phoneNumber: string;
}

interface ContactListProps {
  onSelect: (phoneNumber: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ onSelect }) => {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const searchTerm = searchQuery.toLowerCase();
    return contact.name.toLowerCase().includes(searchTerm) ||
           contact.phoneNumber.includes(searchTerm);
  });

  const formatPhoneNumber = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('234') && cleaned.length > 10) {
      cleaned = '0' + cleaned.slice(3);
    }
    return cleaned.length === 11 ? cleaned : number;
  };

  const fetchContacts = async () => {
    if (contacts.length > 0) return;

    try {
      setIsLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your contacts.',
          [{ text: 'OK' }]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const processedContacts: Contact[] = [];
        data.forEach(contact => {
          if (contact.name && contact.phoneNumbers) {
            contact.phoneNumbers.forEach(phone => {
              if (phone.number) {
                const formattedNumber = formatPhoneNumber(phone.number);
                if (formattedNumber.length === 11) {
                  processedContacts.push({
                    id: phone.id || `${contact.id}-${phone.number}`,
                    name: contact.name,
                    phoneNumber: formattedNumber,
                  });
                }
              }
            });
          }
        });

        const uniqueContacts = Array.from(
          new Map(processedContacts.map(item => [item.phoneNumber, item])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));

        setContacts(uniqueContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchContacts();
    }
  }, [isVisible]);

  const handleSelectContact = (contact: Contact) => {
    onSelect(contact.phoneNumber);
    setIsVisible(false);
    setSearchQuery('');
  };

  const renderContactItem = ({ item, index }: { item: Contact; index: number }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50).springify()}
      style={[styles.contactItem, { backgroundColor: colors.card }]}
    >
      <TouchableOpacity
        onPress={() => handleSelectContact(item)}
        style={styles.contactItemTouchable}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <PhoneCallIcon size={20} color={colors.primary} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>
            {item.phoneNumber}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsVisible(true)}
        style={[styles.contactButton, { backgroundColor: colors.primary + '20' }]}
      >
        <UserCircle2Icon size={28} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={StyleSheet.absoluteFill}>
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          >
            <BlurView
              intensity={20}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            onPress={() => setIsVisible(false)}
            activeOpacity={1}
          />
          
          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown}
            style={[
              styles.bottomSheet,
              { backgroundColor: colors.background }
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Select Contact
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.card }]}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search contacts..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading contacts...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={item => item.id || item.phoneNumber}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      {searchQuery ? 'No contacts found' : 'No contacts available'}
                    </Text>
                  </View>
                }
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 2
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: height * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    paddingVertical: 8,
  },
  contactItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  contactItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});

export default ContactList;