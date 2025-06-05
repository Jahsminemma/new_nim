import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Dimensions
} from "react-native";
import * as Contacts from 'expo-contacts';
import { useTheme } from '@/hooks/useTheme';
import { PhoneCallIcon, X, SearchIcon, UserCircle2Icon } from 'lucide-react-native';
import Modal from './Modal';
import CustomTextInput from "./CustomTextInput";

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
    const { colors } = useTheme();
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
        // Remove all non-digit characters
        let cleaned = number.replace(/\D/g, '');
        
        // Handle Nigerian numbers (remove 234 if present at start)
        if (cleaned.startsWith('234') && cleaned.length > 10) { // Check length to avoid issues with short numbers
            cleaned = '0' + cleaned.slice(3);
        }
        
        // Return only if it's a valid 11-digit number, otherwise return original
        return cleaned.length === 11 ? cleaned : number;
    };

    const fetchContacts = async () => {
        if (contacts.length > 0) return; // Avoid refetching if already loaded

        try {
            setIsLoading(true);
            
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant permission to access your contacts in your phone settings.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
            });

            if (data && data.length > 0) {
                const processedContacts: Contact[] = [];

                data.forEach(contact => {
                    if (contact.name && contact.phoneNumbers) {
                        contact.phoneNumbers.forEach(phone => {
                            if (phone.number) {
                                const formattedNumber = formatPhoneNumber(phone.number);
                                // Only add if formatted number is 11 digits (basic validation)
                                if (formattedNumber.length === 11) {
                                     processedContacts.push({
                                        id: phone.id || `${contact.id}-${phone.number}`, // Use phone id or generate one
                                        name: contact.name,
                                        phoneNumber: formattedNumber,
                                    });
                                }
                            }
                        });
                    }
                });

                // Remove duplicates based on phone number and sort by name
                const uniqueSortedContacts = Array.from(
                    new Map(processedContacts.map(item => [item.phoneNumber, item])).values()
                ).sort((a, b) => a.name.localeCompare(b.name));

                setContacts(uniqueSortedContacts);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            Alert.alert(
                'Error',
                'Failed to load contacts. Please try again.',
                [{ text: 'OK' }]
            );
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
        setSearchQuery(''); // Clear search query on close
    };

    const handleCloseModal = () => {
        setIsVisible(false);
        setSearchQuery(''); // Clear search query on close
    };

    const renderContactItem = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            onPress={() => handleSelectContact(item)}
            style={[styles.contactItem, { 
                backgroundColor: colors.card,
                borderColor: colors.border
            }]}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <PhoneCallIcon color={colors.primary} size={20} />
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
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.contentCenter}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }

        if (filteredContacts.length === 0) {
            return (
                <View style={styles.contentCenter}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        {searchQuery ? 'No contacts found' : 'No contacts available'}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={item => item.id || item.phoneNumber}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <>
            <TouchableOpacity 
                onPress={() => setIsVisible(true)}
                style={[styles.contactButton, { backgroundColor: colors.primary + '20' }]}>
                <UserCircle2Icon
                    size={38}
                    color={colors.primary}
                />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                onClose={handleCloseModal}
                bottom
                height={0.7}
                width={1}
                showCloseButton={false}
            >
                <View style={[styles.modalInnerContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Select Contact
                        </Text>
                        <TouchableOpacity
                            onPress={handleCloseModal}
                            style={[styles.closeButton, { backgroundColor: colors.card }]}>
                            <X color={colors.text} size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <CustomTextInput
                            label=""
                            inputType="default"
                            value={searchQuery}
                            setValue={setSearchQuery}
                            customRightIcon={
                                <SearchIcon
                                    size={28}
                                    color={colors.textSecondary}
                                />
                            }
                        />
                    </View>

                    <View style={styles.contentArea}>
                        {renderContent()}
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    contactButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
    },
    modalInnerContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    searchContainer: {
        marginBottom: 16,
        paddingHorizontal: 0,
    },
    contentArea: {
        flex: 1,
    },
    contentCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingBottom: 24,
        paddingTop: 8,
        paddingHorizontal: 0,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    contactNumber: {
        fontSize: 14,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ContactList;