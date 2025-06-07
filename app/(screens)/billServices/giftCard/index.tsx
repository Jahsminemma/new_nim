import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
  RefreshControl,
  Platform,
  View,
  Text,
  Dimensions,
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
import ScreenHeaderLayout from "@/components/ui/ScreenHeaderLayout";
import PaymentModal from "@/components/ui/PaymentModal";
import { PageLoadingModal } from "@/components/ui/PageLoadingModal";
import Animated, { FadeIn, FadeOut, SlideInRight } from "react-native-reanimated";
import { BlurView } from "expo-blur";

// Add type declaration for lodash
declare module 'lodash';

const { width } = Dimensions.get("window");

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

type ColorScheme = "light" | "dark";

export default function GiftCardScreen() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<GiftCardProduct | null>(
    null
  );

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

  const handleLoadMore = () => {
    if (!giftCardRecord.end && !giftCardRecord.isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setGiftCardRecord((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
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

      console.log(giftCards.content.length);
      

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

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

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
    if (!showModal && !selectedCategory && !showOrderDetails) {
      setSelectedCard({
        ...card,
        category: { name: category }
      });
      setShowModal(true);
    }
  }, [showModal, selectedCategory, showOrderDetails]);

  const handleCategorySelect = React.useCallback((category: string) => {
    if (!selectedCategory && !showModal && !showOrderDetails) {
      setSelectedCategory(category);
    }
  }, [selectedCategory, showModal, showOrderDetails]);


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

  const renderSearchBar = React.useCallback(
    () => (
      <View style={{ padding: 14 }}>
        <CustomTextInput
          placeholder={selectedCategory ? "Search for a biller" : "Search here"}
          value={searchQuery}
          label=""
          setValue={setSearchQuery}
          customRightIcon={<Ionicons name="search" size={20} color="#aaa" />}
          inputType={"default"}
        />
      </View>
    ),
    [selectedCategory, searchQuery]
  );

  const renderGiftCardModal = React.useCallback(
    () => (
      <CustomModal
        visible={showModal}
        onClose={handleModalClose}
        height={0.6}
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
                            backgroundColor:
                              colors.card,
                          },
                          selectedAmount === amount && {
                            backgroundColor:
                              colors.primary,
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
                            selectedAmount === amount && { color: "#fff" },
                          ]}
                        >
                          {amount} {selectedCard.recipientCurrencyCode}
                        </Text>
                        <Text
                          style={[
                            styles.senderAmount,
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
                    <Text style={styles.senderAmount}>
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
                  (!selectedAmount || !recipientEmail) && styles.disabledButton,
                ]}
                onPress={() => {
                  setShowModal(false);
                  setShowOrderDetails(true);
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
    [showModal, selectedCard, selectedAmount, recipientEmail, handleModalClose]
  );

  const handleImageError = () => {
    console.log("Error loading flag");
  };
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

  const renderCountrySelector = () => (
    <TouchableOpacity
      style={styles.currencySelector}
      onPress={() => setShowCountryModal(true)}
    >
      {selectedCountry ? (
        <>
          <SvgUri
            uri={selectedCountry.flagUrl}
            width={24}
            height={24}
            style={styles.countryFlag}
            onError={handleImageError}
            preserveAspectRatio="xMidYMid meet"
          />
          <Text style={styles.currencyText}>
            {selectedCountry.isoName}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#aaa" />
        </>
      ) : (
        <Text style={styles.currencyText}>Select Country</Text>
      )}
    </TouchableOpacity>
  );

  const renderCountryModal = () => (
    <CustomModal
      visible={showCountryModal}
      onClose={handleCountryModalClose}
      height={0.8}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Country</Text>
        <CustomTextInput
          placeholder="Search by name, code, or currency"
          value={countrySearchQuery}
          onChangeText={setCountrySearchQuery}
          placeholderTextColor="#777"
          label={""}
          inputType={"default"}
          setValue={setCountrySearchQuery}
          customRightIcon={<Ionicons name="search" size={20} color="#666" />}
        />
        <FlatList
          data={filteredCountries || []}
          keyExtractor={(item) => item.isoName}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countryItem,
                selectedCountry?.isoName === item.isoName &&
                  styles.selectedCountry,
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
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.currencyName}>{item.currencyName}</Text>
              </View>
              {selectedCountry?.isoName === item.isoName && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.countryList}
        />
      </View>
    </CustomModal>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}></TouchableOpacity>
      <Text style={styles.headerTitle}>
        {selectedCategory ? selectedCategory : "Gift Cards"}
      </Text>
      {renderCountrySelector()}
    </View>
  );

  const renderMainView = () => (
    <ScreenHeaderLayout>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gift Cards</Text>
        <TouchableOpacity
          style={styles.currencySelector}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={styles.currencyText} numberOfLines={1}>
            {selectedCountry?.currency?.code || "Select"}
          </Text>
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
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const height = event.nativeEvent.contentSize.height;
          const distanceFromEnd = height - offsetY;
          const threshold = height * 0.9;
          if (distanceFromEnd < threshold && !isLoadingMore) {
            handleLoadMore();
          }
        }}
      >
        <View style={styles.searchContainer}>
          <CustomTextInput
            placeholder="Search gift cards"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading gift cards...</Text>
          </View>
        ) : giftCardError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
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
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <TouchableOpacity
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardsRow}
                  >
                    {cards.map((card, index) => (
                      <Animated.View
                        entering={FadeIn.delay(index * 100)}
                        style={styles.cardItem}
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
                          <Text style={styles.cardName}>
                            {card.country.isoName} {card.brand.brandName}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </ScrollView>
                </Animated.View>
              );
            }}
            ListFooterComponent={() =>
              isLoadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        )}
      </ScrollView>
    </ScreenHeaderLayout>
  );

  const renderCategoryDetail = React.useCallback(() => {
    const categoryCards = filteredGroupedCards[selectedCategory!] || [];

    return (
      <CustomModal
        visible={!!selectedCategory}
        onClose={handleCategoryModalClose}
        addHeight={0.8}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedCategory}</Text>
          </View>
          {renderSearchBar()}
          {isLoadingGiftCards && currentPage === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Text style={styles.loadingText}>Loading gift cards...</Text>
            </View>
          ) : categoryCards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
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
                  style={styles.listItem}
                  onPress={() => {
                    if (!showModal) {
                      setSelectedCard(item);
                      setShowModal(true);
                    }
                  }}
                >
                  <Image
                    source={{ uri: item.logoUrls[0] }}
                    style={styles.listItemLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.listItemName}>
                    {item.country.isoName} {item.brand.brandName}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                isLoadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                    />
                    <Text style={styles.loadingMoreText}>Loading more...</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </CustomModal>
    );
  }, [selectedCategory]);

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
      backgroundColor: colors.background,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 8,
      color: colors.text,
    },
    currencySelector: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    searchContainer: {
      margin: 16,
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.primary,
    },
    cardsRow: {
      paddingLeft: 16,
    },
    cardItem: {
      marginRight: 16,
      width: 160,
      backgroundColor: colors.card,
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
      color: colors.text,
      textAlign: "left",
    },
    modalContent: {
      padding: 16,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      color: colors.text,
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginBottom: 16,
      color: colors.text,
    },
    amountContainer: {
      marginBottom: 24,
    },
    amountButton: {
      padding: 16,
      borderRadius: 12,
      marginRight: 12,
      minWidth: 120,
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    senderAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    purchaseButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 24,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
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
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
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
      color: colors.textSecondary,
    },
    countryItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedCountry: {
      backgroundColor: colors.card,
    },
    countryInfo: {
      flex: 1,
      marginLeft: 12,
    },
    countryName: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
      color: colors.text,
    },
    currencyName: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    countryList: {
      paddingBottom: 16,
    },
    loadingMoreContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    loadingMoreText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
    },
    customAmountContainer: {
      marginBottom: 24,
      backgroundColor: colors.card,
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

  if (isLoadingGiftCards) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.loadingText}>Loading gift cards...</Text>
      </View>
    );
  }

  if (giftCardError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load gift cards</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {showOrderDetails && (
        <PaymentModal
          visible={showOrderDetails}
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
