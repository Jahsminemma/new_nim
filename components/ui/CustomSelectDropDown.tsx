import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export interface IData {
  name: string;
  value: string | number;
  code?: string;
  subText?: string;
  variation_amount?: string;
  imageUrl?: string;
}

interface ICustomSelectDropDown {
  modalTitle?: string;
  label: string;
  value: any;
  data: IData[];
  setValue: (item: IData) => void;
  placeholder?: string;
  borderColor?: string;
  bottom?: boolean;
  addHeight?: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  isBankList?: boolean;
  isBill?: boolean;
}

const CustomSelectDropDown: React.FC<ICustomSelectDropDown> = ({
  modalTitle = 'Select Option',
  label,
  value,
  data,
  setValue,
  placeholder = 'Select an option',
  borderColor,
  bottom = true,
  addHeight = 0,
  isLoading = false,
  isDisabled = false,
  isBankList = false,
  isBill = false,
}) => {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const modalHeight = Math.min(height * 0.8 + addHeight, height - 100);

  const handleSelect = (item: IData) => {
    setValue(item);
    setIsVisible(false);
  };

  const renderBankListItem = ({ item, index }: { item: IData; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 50).springify()}>
      <TouchableOpacity
        style={[
          styles.bankListItem,
          { 
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          }
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.bankItemContent}>
          {item.imageUrl && (
            <View style={[styles.bankImageContainer, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.bankItemImage}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.bankTextContent}>
            <Text style={[styles.bankItemName, { color: colors.text }]} numberOfLines={2}>
              {item.name.split("Distribution")[0]}
            </Text>
            
            {item.subText && (
              <Text style={[styles.bankItemSubText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.subText}
              </Text>
            )}
            
            {item.code && (
              <Text style={[styles.bankItemCode, { color: colors.primary }]}>
                Code: {item.code}
              </Text>
            )}
          </View>
        </View>

        {/* Selection Indicator */}
        {value?.value === item.value && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRegularItem = ({ item, index }: { item: IData; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 50).springify()}>
      <TouchableOpacity
        style={[
          styles.listItem,
          { 
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          }
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          {/* Image */}
          {item.imageUrl && (
            <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.itemImage}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            
            {item.subText && (
              <Text style={[styles.itemSubText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.subText}
              </Text>
            )}
            
            {item.code && (
              <Text style={[styles.itemCode, { color: colors.primary }]}>
                Code: {item.code}
              </Text>
            )}
          </View>

          {/* Amount */}
          {item.variation_amount && (
            <View style={styles.amountContainer}>
              <Text style={[styles.itemAmount, { color: colors.primary }]}>
                ₦{parseFloat(item.variation_amount).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Selection Indicator */}
        {value?.value === item.value && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {isLoading ? 'Loading options...' : 'No options available'}
      </Text>
    </View>
  );

  const renderSelectedValue = () => {
    if (value && value.name) {
      return (
        <View style={styles.selectedValueContainer}>
          {value.imageUrl && (
            <Image
              style={[
                styles.selectedValueImage,
                isBill && styles.selectedValueImageBill
              ]}
              source={{ uri: value.imageUrl }}
            />
          )}
          <Text style={[
            styles.selectedValueText,
            { 
              color: colors.text,
              fontWeight: isBill ? '700' : '400',
              fontSize: isBill ? 18 : 15
            }
          ]}>
            {isBankList ? value.name.split("Distribution")[0] : value.name}
          </Text>
        </View>
      );
    }

    return (
      <Text style={[
        styles.placeholderText,
        { 
          color: isLoading ? colors.textSecondary : colors.textSecondary + '80',
          fontWeight: '400',
          fontSize: 15
        }
      ]}>
        {isLoading ? 'Loading...' : placeholder}
      </Text>
    );
  };

  return (
    <ScrollView>
      {/* Label */}
      {!isBill && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerButton,
          {
            backgroundColor: colors.card,
            borderColor: borderColor || colors.border,
            borderWidth: isBill ? 0 : 0.5,
          },
          isDisabled && styles.disabledButton,
        ]}
        onPress={() => !isDisabled && !isLoading && setIsVisible(true)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          <View style={styles.triggerTextContainer}>
            {isBill && (
              <Text style={[styles.billLabel, { color: colors.text }]}>
                {label}
              </Text>
            )}
            {renderSelectedValue()}
          </View>
          
          {!isLoading && (
            <View style={styles.chevronContainer}>
              {isVisible ? (
                <ChevronUp size={18} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={18} color={colors.textSecondary} />
              )}
            </View>
          )}
        </View>
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
            style={StyleSheet.absoluteFill}
          >
            <BlurView
              intensity={20}
              tint={isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
            />

            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsVisible(false)}
            />
          </Animated.View>

          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown}
            style={[
              styles.bottomSheet,
              {
                backgroundColor: colors.card,
                height: modalHeight,
              },
              !bottom && styles.centerModal,
            ]}
          >
            {bottom && (
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
              </View>
            )}

            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {modalTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.background }]}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {data && data.length === 0 ? (
                renderEmptyState()
              ) : (
                <FlatList
                  data={data}
                  renderItem={isBankList ? renderBankListItem : renderRegularItem}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  billLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  triggerButton: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingLeft: 15,
    height: 55,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerTextContainer: {
    flex: 1,
  },
  selectedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedValueImage: {
    width: '10%',
    height: 20,
    marginRight: 10,
    borderRadius: 50,
  },
  selectedValueImageBill: {
    height: 25,
  },
  selectedValueText: {
    fontFamily: 'Inter-Regular',
  },
  placeholderText: {
    fontFamily: 'Inter-Regular',
  },
  chevronContainer: {
    marginRight: 15,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerModal: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -200 }],
    borderRadius: 24,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
  textContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  itemSubText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  // Bank List Specific Styles
  bankListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.7,
    position: 'relative',
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankImageContainer: {
    width: 25,
    height: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankItemImage: {
    width: '100%',
    height: '100%',
  },
  bankTextContent: {
    flexDirection: 'column',
    flex: 1,
  },
  bankItemName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.05,
  },
  bankItemSubText: {
    fontSize: 10,
    marginTop: 5,
    fontFamily: 'Inter-Bold',
  },
  bankItemCode: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
});

export default CustomSelectDropDown;