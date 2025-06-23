import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
  RefreshControl,
  View,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useGetCountriesQuery,
  useGetGiftCardsMutation,
} from "../../../../redux/slice/giftCardSplice";
import { SvgUri } from "react-native-svg";
import { uniqBy, round } from "lodash";
import { useGetTransactionFXQuery } from "../../../../redux/slice/walletsApiSplice";
import { usePlaceOrderMutation } from "../../../../redux/slice/servicesApiSlice";
import { useTheme } from "@/hooks/useTheme";
import { calculateTransactionFee, textFormatter } from "@/utils";
import { useHandleMutationError } from "@/hooks/useError";
import { IOrderDetailItem, OrderRequest } from "../types";
import CustomTextInput from "@/components/ui/CustomTextInput";
import CustomModal from "@/components/ui/CustomModal";
import ScreenHeaderLayout from "@/components/layout/ScreenHeaderLayout";
import PaymentModal from "@/components/ui/PaymentModal";
import { PageLoadingModal } from "@/components/ui/PageLoadingModal";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

interface Country {
  isoName: string;
  name: string;
  currencyCode: string;
  currencyName: string;
  flagUrl: string;
}

interface GiftCardProduct {
  productId: number;
  productName: string;
  brand: {
    brandName: string;
  };
  country: {
    isoName: string;
    name: string;
    flagUrl: string;
  };
  category: {
    name: string;
  };
  logoUrls: string[];
  fixedRecipientDenominations?: number[];
  fixedRecipientToSenderDenominationsMap?:
    | Record<string, number>
    | { [key: string]: number };
  minRecipientDenomination?: number;
  maxRecipientDenomination?: number;
  minSenderDenomination?: number;
  maxSenderDenomination?: number;
  recipientCurrencyCode: string;
  senderCurrencyCode: string;
  senderFee?: number;
}

export default function GiftCardScreen() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<GiftCardProduct | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 200;
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [transFee, setTransFee] = useState<number>(0);
  const [pin, setPin] = useState<string>("");
  const [billAmount, setBillAmount] = useState<number>(0);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [
    getGiftCards,
    { isLoading: isLoadingGiftCards, error: giftCardError },
  ] = useGetGiftCardsMutation();
  const { colors } = useTheme();  

  const [giftCardRecord, setGiftCardRecord] = useState<{
    data: GiftCardProduct[];
    isLoading: boolean;
    page: number;
    end: boolean;
  }>({
    data: [],
    isLoading: false,
    page: 0,
    end: false,
  });

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [refreshing, setRefreshing] = useState(true);
  const { data: countriesData } = useGetCountriesQuery({});

  // Set initial country to United States
  React.useEffect(() => {
    if (countriesData && !selectedCountry) {
      const usCountry = countriesData.find(
        (country: Country) => country.isoName === "US"
      );
      if (usCountry) {
        setSelectedCountry(usCountry);
      }
    }
  }, [countriesData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setGiftCardRecord({
      data: [],
      isLoading: false,
      page: 0,
      end: false,
    });
    fetchGiftCards();
  };

  const fetchGiftCards = async () => {
    setGiftCardRecord((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const giftCards = await getGiftCards({
        page: giftCardRecord.page,
        size: PAGE_SIZE,
        countryCode: selectedCountry?.isoName,
      }).unwrap();

      const giftCardsData = giftCards.content;
      if (giftCardsData) {
        setGiftCardRecord((prev) => ({
          ...prev,
          data: uniqBy([...prev.data, ...giftCardsData], "productId"),
          isLoading: false,
        }));

        if (giftCardsData.length === 0) {
          setGiftCardRecord((prev) => ({
            ...prev,
            end: true,
            isLoading: false,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      setGiftCardRecord((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
    setIsLoadingMore(false);
    setRefreshing(false);
  };

  React.useEffect(() => {
    if (selectedCountry?.isoName) {
      setIsDebouncing(true);
      setRefreshing(true);
      setGiftCardRecord({
        data: [],
        isLoading: false,
        page: 0,
        end: false,
      });
      fetchGiftCards();
      setRefreshing(false);
      setIsDebouncing(false);
    }
  }, [selectedCountry?.isoName]);

  React.useEffect(() => {
    if (giftCardRecord.page > 0 && !refreshing) {
      fetchGiftCards();
    }
  }, [giftCardRecord.page]);

  useEffect(() => {
    const nairaToDollar = Number(transactionFx?.nairaToDollar);
    const usdValue =
      nairaToDollar && (Number(amount) / Number(nairaToDollar)).toFixed(4);

    const fee = calculateTransactionFee(
      Number(amount),
      nairaToDollar,
      Number(transactionFx?.percentagePerWithdrawal)
    );
    setUsdAmount(Number(usdValue));
    setTransFee(fee);
  }, [billAmount]);

  const handleGiftCardPayload: OrderRequest = {
    category: "GIFT_CARD",
    provider: (selectedCard && selectedCard.brand.brandName) || "",
    amount: Number(usdAmount),
    fee: Number(transFee),
    narration: "",
    pin,
    saveBeneficiary: false,
    phoneNumber: "",
    giftCard: {
      unitPrice: Number(billAmount),
      productId: (selectedCard && selectedCard.productId) || 0,
      recipientEmail: recipientEmail,
    },
  };

  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);

  const totalAmount = +amount + Number(nairaFee);

  const [placeOrder] = usePlaceOrderMutation();

  const handleGiftCardPayment = async () => {
    try {
      setLoading(true);
      const paymentResponse = await placeOrder(handleGiftCardPayload).unwrap();
      setPin("");
      setLoading(false);
      router.replace({
        pathname: "/(screens)/billServices/transaction/success",
        params: {
          amount: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
          response: JSON.stringify(paymentResponse.data),
          returnPath: "/(screens)/reward",
          message: "Successful",
        },
      });
    } catch (error) {
      setPin("");
      setLoading(false);
      useHandleMutationError(error);
    }
  };

  const orderDetailLists: IOrderDetailItem[] = [
    { label: "Brand", value: `${selectedCard?.brand.brandName}` },
    { label: "Amount", value: `₦${textFormatter(String(amount), true, true)}` },
    { label: "Transaction fee", value: `₦${nairaFee}` },
    {
      label: "Total amount",
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  const groupedGiftCards = React.useMemo(() => {
    if (!giftCardRecord.data.length) return {};

    return giftCardRecord.data.reduce(
      (acc: Record<string, GiftCardProduct[]>, card: GiftCardProduct) => {
        const category = card.category.name;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(card);
        return acc;
      },
      {}
    );
  }, [giftCardRecord.data]);

  // Memoize handlers to prevent re-renders
  const handleModalClose = React.useCallback(() => {
    setShowModal(false);
    setSelectedAmount(null);
    setRecipientEmail("");
    setPin("");
  }, []);

  const handleCountryModalClose = React.useCallback(() => {
    setShowCountryModal(false);
    setCountrySearchQuery("");
  }, []);

  const handleCategoryModalClose = React.useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
  }, []);

  const handleOrderModalClose = React.useCallback(() => {
    setShowOrderDetails(false);
    setPin("");
  }, []);

  const handleCardSelect = React.useCallback((card: GiftCardProduct, category: string) => {
    setSelectedCard({
      ...card,
      category: { name: category }
    });
    // Close category modal if open, then open gift card modal
    if (selectedCategory) {
      setSelectedCategory(null);
    }
    setShowModal(true);
  }, [selectedCategory]);

  const handleCategorySelect = React.useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const filteredGroupedCards = React.useMemo(() => {
    if (!searchQuery) return groupedGiftCards;

    const filtered: Record<string, GiftCardProduct[]> = {};
    Object.entries(groupedGiftCards).forEach(([category, cards]) => {
      const filteredCards = cards.filter(
        (card: GiftCardProduct) =>
          card.brand.brandName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          card.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredCards.length > 0) {
        filtered[category] = filteredCards;
      }
    });
    return filtered;
  }, [groupedGiftCards, searchQuery]);

  const filteredCountries = React.useMemo(() => {
    if (!countriesData || !countrySearchQuery) return countriesData;

    const query = countrySearchQuery.toLowerCase();
    return countriesData.filter(
      (country: Country) =>
        country.name.toLowerCase().includes(query) ||
        country.isoName.toLowerCase().includes(query) ||
        country.currencyCode.toLowerCase().includes(query) ||
        country.currencyName.toLowerCase().includes(query)
    );
  }, [countriesData, countrySearchQuery]);

  const calculateSenderAmount = (recipientAmount: number): number => {
    if (!selectedCard) return 0;

    if (selectedCard.fixedRecipientToSenderDenominationsMap) {
      const amount = recipientAmount.toFixed(1);
      return selectedCard.fixedRecipientToSenderDenominationsMap[amount] || 0;
    }

    const recipientRange =
      (selectedCard.maxRecipientDenomination || 0) -
      (selectedCard.minRecipientDenomination || 0);
    const senderRange =
      (selectedCard.maxSenderDenomination || 0) -
      (selectedCard.minSenderDenomination || 0);

    if (recipientRange === 0 || senderRange === 0) return 0;

    const ratio = senderRange / recipientRange;
    return round(
      (recipientAmount - (selectedCard.minRecipientDenomination || 0)) * ratio +
        (selectedCard.minSenderDenomination || 0)
    );
  };

  const handleImageError = () => {
    console.log("Error loading flag");
  };

  const renderGiftCardModal = React.useCallback(
    () => (
      <CustomModal
        visible={showModal}
        onClose={handleModalClose}
        height={0.7}
      >
        <View style={styles.modalContent}>
          {selectedCard && (
            <>
              <View style={styles.modalHeader}>
                <Image
                  source={{ uri: selectedCard.logoUrls[0] }}
                  style={styles.modalLogo}
                  resizeMode="contain"
                />
                <Text style={styles.modalTitle}>
                  {selectedCard.brand.brandName}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCard.country.name}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Select Amount</Text>
              {selectedCard.fixedRecipientDenominations &&
              selectedCard.fixedRecipientToSenderDenominationsMap ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.amountContainer}
                >
                  {selectedCard.fixedRecipientDenominations.map((amount) => {
                    const decimalKey = amount.toFixed(1);
                    const wholeKey = amount.toString();
                    const senderAmount =
                      selectedCard.fixedRecipientToSenderDenominationsMap?.[
                        decimalKey
                      ] ||
                      selectedCard.fixedRecipientToSenderDenominationsMap?.[
                        wholeKey
                      ] ||
                      0;

                    return (
                      <TouchableOpacity
                        key={amount}
                        style={[
                          styles.amountButton,
                          {
                            backgroundColor: colors.card,
                          },
                          selectedAmount === amount && {
                            backgroundColor: colors.primary,
                          },
                        ]}
                        onPress={() => {
                          setBillAmount(amount);
                          setAmount(
                            senderAmount + (selectedCard.senderFee || 1700)
                          );
                          setSelectedAmount(amount);
                        }}
                      >
                        <Text
                          style={[
                            styles.amountText,
                            { color: colors.text },
                            selectedAmount === amount && { color: "#fff" },
                          ]}
                        >
                          {amount} {selectedCard.recipientCurrencyCode}
                        </Text>
                        <Text
                          style={[
                            styles.senderAmount,
                            { color: colors.textSecondary },
                            selectedAmount === amount && { color: "#fff" },
                          ]}
                        >
                          {senderAmount + (selectedCard.senderFee || 1700)}{" "}
                          {selectedCard.senderCurrencyCode}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.customAmountContainer}>
                  <CustomTextInput
                    placeholder={`Enter amount (${selectedCard.minRecipientDenomination} - ${selectedCard.maxRecipientDenomination} ${selectedCard.recipientCurrencyCode})`}
                    value={selectedAmount?.toString() || ""}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    color={colors.primary}
                    label={""}
                    inputType={"default"}
                    setValue={(text) => {
                      const amount = parseFloat(text);
                      if (!isNaN(amount)) {
                        if (
                          amount >=
                            (selectedCard.minRecipientDenomination || 0) &&
                          amount <=
                            (selectedCard.maxRecipientDenomination || Infinity)
                        ) {
                          setBillAmount(amount);
                          setSelectedAmount(amount);
                          const senderAmount = calculateSenderAmount(amount);
                          setAmount(senderAmount + (selectedCard.senderFee || 1700));
                        }
                      } else {
                        setSelectedAmount(null);
                        setBillAmount(0);
                        setAmount(0);
                      }
                    }}
                  />
                  {selectedAmount && (
                    <Text style={[styles.senderAmount, { color: colors.textSecondary }]}>
                      {calculateSenderAmount(selectedAmount) + (selectedCard.senderFee || 1700)}{" "}
                      {selectedCard.senderCurrencyCode}
                    </Text>
                  )}
                </View>
              )}

              <CustomTextInput
                placeholder="Recipient's Email"
                value={recipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                label={"Recipient Details"}
                inputType={"default"}
                setValue={setRecipientEmail}
              />

              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  { backgroundColor: colors.primary },
                  (!selectedAmount || !recipientEmail) && styles.disabledButton,
                ]}
                onPress={() => {
                  setShowModal(false);
                  setTimeout(() => setShowOrderDetails(true), 100)
                }}
                disabled={!selectedAmount || !recipientEmail}
              >
                <Text style={styles.purchaseButtonText}>
                  Purchase Gift Card
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </CustomModal>
    ),
    [showModal, selectedCard, selectedAmount, recipientEmail, handleModalClose, colors]
  );

  const renderCountryModal = () => (
    <CustomModal
      visible={showCountryModal}
      title="Select Country"
      onClose={handleCountryModalClose}
      height={0.8}
    >
      <View style={styles.modalContent}>
        <CustomTextInput
          placeholder="Search by name, code, or currency"
          value={countrySearchQuery}
          placeholderTextColor="#777"
          label={""}
          inputType={"default"}
          setValue={setCountrySearchQuery}
          customRightIcon={<Ionicons name="search\" size={20} color="#666" />}
        />
        <FlatList
          data={filteredCountries || []}
          keyExtractor={(item) => item.isoName}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countryItem,
                { borderBottomColor: colors.border },
                selectedCountry?.isoName === item.isoName && {
                  backgroundColor: colors.card,
                },
              ]}
              onPress={() => {
                setSelectedCountry(item);
                setShowCountryModal(false);
                setCountrySearchQuery("");
              }}
            >
              <SvgUri
                uri={item.flagUrl}
                width={44}
                height={44}
                style={styles.countryFlag}
                onError={handleImageError}
                preserveAspectRatio="xMidYMid meet"
              />
              <View style={styles.countryInfo}>
                <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{item.currencyName}</Text>
              </View>
              {selectedCountry?.isoName === item.isoName && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.countryList}
        />
      </View>
    </CustomModal>
  );

  const renderMainView = () => (
    <ScreenHeaderLayout headerTitle="Gift Cards">
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity
          style={[styles.currencySelector, { backgroundColor: colors.card }]}
          onPress={() => setShowCountryModal(true)}
        >
          {selectedCountry && (
            <>
              <SvgUri
                uri={selectedCountry.flagUrl}
                width={24}
                height={24}
                style={styles.countryFlag}
                onError={handleImageError}
                preserveAspectRatio="xMidYMid meet"
              />
              <Text style={[styles.currencyText, { color: colors.text }]} numberOfLines={1}>
                {selectedCountry.isoName}
              </Text>
            </>
          )}
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <CustomTextInput
            placeholder="Search gift cards"
            value={searchQuery}
            setValue={setSearchQuery}
            label=""
            inputType="default"
            customRightIcon={<Ionicons name="search\" size={20} color={colors.textSecondary} />}
          />
        </View>

        {isDebouncing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading gift cards...</Text>
          </View>
        ) : giftCardError ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {giftCardError?.data?.message || "Failed to load gift cards"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={Object.entries(filteredGroupedCards)}
            keyExtractor={(item) => item[0]}
            renderItem={({ item }) => {
              const [category, cards] = item;
              return (
                <Animated.View
                  entering={SlideInRight}
                  style={styles.categorySection}
                >
                  <View style={styles.categoryHeader}>
                    <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
                    <TouchableOpacity
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardsRow}
                  >
                    {cards.map((card, index) => (
                      <Animated.View
                        key={card.productId}
                        entering={FadeIn.delay(index * 100)}
                        style={[styles.cardItem, { backgroundColor: colors.card }]}
                      >
                        <TouchableOpacity
                          onPress={() => handleCardSelect(card, category)}
                          style={{ alignItems: 'center' }}
                        >
                          <Image
                            source={{ uri: card.logoUrls[0] }}
                            style={styles.cardLogo}
                            resizeMode="contain"
                          />
                          <Text style={[styles.cardName, { color: colors.text }]}>
                            {card.country.isoName} {card.brand.brandName}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </ScrollView>
                </Animated.View>
              );
            }}
          />
        )}
      </ScrollView>
    </ScreenHeaderLayout>
  );

  const renderCategoryDetail = React.useCallback(() => {
    if (!selectedCategory) return null;
    
    const categoryCards = filteredGroupedCards[selectedCategory] || [];

    return (
      <CustomModal
        visible={!!selectedCategory}
        onClose={handleCategoryModalClose}
        height={0.9}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCategory}</Text>
          </View>
          
          <View style={{ padding: 14 }}>
            <CustomTextInput
              placeholder="Search for a biller"
              value={searchQuery}
              label=""
              setValue={setSearchQuery}
              customRightIcon={<Ionicons name="search\" size={20} color="#aaa" />}
              inputType={"default"}
            />
          </View>

          {categoryCards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? "No gift cards found matching your search"
                  : `No gift cards available in ${selectedCategory}`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={categoryCards}
              keyExtractor={(item) => item.productId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    handleCardSelect(item, selectedCategory);
                  }}
                >
                  <Image
                    source={{ uri: item.logoUrls[0] }}
                    style={styles.listItemLogo}
                    resizeMode="contain"
                  />
                  <Text style={[styles.listItemName, { color: colors.text }]}>
                    {item.country.isoName} {item.brand.brandName}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </CustomModal>
    );
  }, [selectedCategory, filteredGroupedCards, searchQuery, colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 5,
      marginTop: -20,
      width: '100%',
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 8,
    },
    currencySelector: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      minWidth: 100,
      maxWidth: 120,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    currencyText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      marginRight: 4,
      flexShrink: 1,
    },
    searchContainer: {
      margin: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    categoryTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    cardsRow: {
      paddingLeft: 16,
    },
    cardItem: {
      marginRight: 16,
      width: 160,
      borderRadius: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    cardLogo: {
      width: '100%',
      height: 100,
      borderRadius: 8,
      marginBottom: 12,
    },
    cardName: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      textAlign: "left",
    },
    modalContent: {
      padding: 16,
    },
    modalHeader: {
      alignItems: "center",
      marginBottom: 24,
    },
    modalLogo: {
      width: 120,
      height: 80,
      marginBottom: 16,
      borderRadius: 8,
    },
    modalTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginBottom: 16,
    },
    amountContainer: {
      marginBottom: 24,
    },
    amountButton: {
      padding: 16,
      borderRadius: 12,
      marginRight: 12,
      minWidth: 120,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    amountText: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
    },
    senderAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    purchaseButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    disabledButton: {
      opacity: 0.5,
    },
    purchaseButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      textAlign: "center",
    },
    countryItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
    },
    countryInfo: {
      flex: 1,
      marginLeft: 12,
    },
    countryName: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
    },
    currencyName: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    countryList: {
      paddingBottom: 16,
    },
    customAmountContainer: {
      marginBottom: 24,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    listContainer: {
      padding: 16,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    listItemLogo: {
      width: 40,
      height: 40,
      marginRight: 16,
      borderRadius: 8,
    },
    listItemName: {
      fontSize: 16,
      flex: 1,
    },
    countryFlag: {
      width: 24,
      height: 24,
      marginRight: 8,
      borderRadius: 12,
    },
  });

  if (isLoadingGiftCards && giftCardRecord.data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading gift cards...</Text>
      </View>
    );
  }

  if (giftCardError && giftCardRecord.data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Failed to load gift cards</Text>
        <TouchableOpacity 
          style={[styles.purchaseButton, { backgroundColor: colors.primary, marginTop: 16 }]} 
          onPress={handleRefresh}
        >
          <Text style={styles.purchaseButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {showOrderDetails && (
        <PaymentModal
          visible={true}
          onClose={() => setShowOrderDetails(false)}
          onClickPay={handleGiftCardPayment}
          orderItemDetails={orderDetailLists}
          orderDetailLabel={`₦${textFormatter(String(totalAmount), true, true)}`}
          orderDetailTitle="Payment"
          pin={pin}
          setPin={setPin}
          label={`₦${textFormatter(billAmount, true, true)}`}
        />
      )}
      {renderMainView()}
      {renderGiftCardModal()}
      {renderCountryModal()}
      {renderCategoryDetail()}
      <PageLoadingModal visible={loading} />
    </>
  );
}