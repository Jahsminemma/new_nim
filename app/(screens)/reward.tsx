import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, FlatList } from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import {
  useGetTransactionFXQuery,
  useGetWalletQuery,
} from "../../redux/slice/walletsApiSplice";
import { Href, router } from "expo-router";
import { currencyConverter, textFormatter } from "@/utils";
import {
  PhoneCallIcon,
  HouseWifi,
  Zap,
  MonitorPlay,
  ArrowRight,
  Gift,
  ArrowLeft,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CONTAINER_PADDING = 20;
const ITEM_GAP_HORIZONTAL = 10; 
const ITEM_GAP_VERTICAL = 15; 

const totalHorizontalPadding = CONTAINER_PADDING * 3;
const totalHorizontalGap = ITEM_GAP_HORIZONTAL * (NUM_COLUMNS - 1);
const ITEM_WIDTH = (width - totalHorizontalPadding - totalHorizontalGap) / NUM_COLUMNS;

const Reward = () => {
  const { colors } = useTheme();
  const { data: userWallet } = useGetWalletQuery({}, { refetchOnFocus: true });
  const wallet = userWallet?.data;
  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );
  const [baseCurrencyRewardAmount, setBaseCurrencyWalletAmount] = useState<String>("");

  useEffect(() => {
    const nairaEquivalent =
      Number(wallet?.usdValueEquivalent) *
        Number(transactionFx?.nairaToDollar) || 0;

    wallet &&
      currencyConverter(Number(nairaEquivalent), wallet?.currency).then((res) =>
        setBaseCurrencyWalletAmount(res)
      );
  }, [transactionFx, wallet]);

  type BillTypes = {
    name: string;
    icon: ReactNode;
    link: Href<string>;
  };

  const billData: BillTypes[] = [
    {
      name: "Airtime",
      icon: <PhoneCallIcon color={colors.primary} size={24} />,
      link: "/(screens)/billServices/airtime" as Href<string>,
    },
    {
      name: "Data",
      icon: <HouseWifi color={colors.primary} size={24} />,
      link: "/(screens)/billServices/data" as Href<string>,
    },
    {
      name: "TV",
      icon: <MonitorPlay color={colors.primary} size={24} />,
      link: "/(screens)/billServices/cable" as Href<string>,
    },
    {
      name: "Electricity",
      icon: <Zap color={colors.primary} size={24} />,
      link: "/(screens)/billServices/electricity" as Href<string>,
    },
    {
      name: "Gift Card",
      icon: <Gift color={colors.primary} size={24} />,
      link: "/(screens)/billServices/giftCard" as Href<string>,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>

        <Text style={[styles.pageTitle, { color: colors.text }]}>
          Giveaway reward
        </Text>
      </View>

      <ScrollView style={styles.container}>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceTitle, { color: colors.textSecondary }]}>Total balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            $ {textFormatter(wallet?.usdValueEquivalent, true, true)}
          </Text>
          <Text style={[styles.balanceEquivalent, { color: colors.textSecondary }]}>
            ≈ {wallet?.currency}{" "}
            {textFormatter(String(baseCurrencyRewardAmount), true, true)}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.withdrawContainer}
        >
          <TouchableOpacity
            disabled={true} // Assuming withdraw is not yet implemented
            onPress={() => router.push("/withdraw" as Href<string>)}
            style={styles.withdrawButton}
          >
            <LinearGradient
              colors={['#FF6B6B', colors.primary, '#FFD166']}
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.withdrawButtonText}>
                Withdraw
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.limitContainer}>
            <Text style={[styles.limitText, { color: colors.textSecondary }]}>
              Daily withdrawal limit (Remain/Total)
            </Text>
            <Text style={[styles.limitText, { color: colors.textSecondary }]}>
              $1000 / $1000
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.billsHeader}
        >
          <Text style={[styles.billsTitle, { color: colors.text }]}>
            Pay Bills
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(screens)/billServices/transaction' as Href<string>)}
            style={styles.historyButton}
          >
            <Text style={[styles.historyText, { color: colors.primary }]}>
              Transaction history
            </Text>
            <ArrowRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.billsGridContainer}>
          {billData.map((bill, index) => (
            <Animated.View
              key={bill.name}
              entering={FadeInDown.delay(300 + index * 50).springify()}
              style={styles.billItemContainer}
            >
              <TouchableOpacity
                onPress={() => router.push(bill.link)}
                style={[styles.billItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.billIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  {bill.icon}
                </View>
                <Text style={[styles.billName, { color: colors.text }]}>
                  {bill.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    paddingTop: 80, // Add padding to account for the fixed header
    paddingBottom: 20,
  },
  balanceCard: {
    marginHorizontal: CONTAINER_PADDING,
    marginTop: 30,
    padding: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 52,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  balanceEquivalent: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  withdrawContainer: {
    paddingHorizontal: CONTAINER_PADDING,
    marginTop: 40,
  },
  withdrawButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  withdrawButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  limitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 8,
  },
  limitText: {
    fontSize: 13,
    opacity: 0.7,
  },
  billsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: CONTAINER_PADDING,
    marginBottom: 20,
  },
  billsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  billsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: CONTAINER_PADDING,
    marginTop: 2,
    gap: ITEM_GAP_HORIZONTAL, 
    rowGap: ITEM_GAP_VERTICAL, 
  },
  billItemContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    // Margins are handled by gap and rowGap on the container
  },
  billItem: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  billIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  billName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Reward;
