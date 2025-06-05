import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';
import {
  ArrowLeft,
  History,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useGetTransactionFXQuery,
  useGetWalletQuery,
} from '../../redux/slice/walletsApiSplice';
import { currencyConverter, textFormatter } from '@/utils';

const mockTransactions = [
  {
    id: '1',
    type: 'earn',
    amount: 500,
    description: 'Event Participation Reward',
    date: '2024-03-15T10:30:00Z',
    status: 'completed',
    category: 'event',
  },
  {
    id: '2',
    type: 'spend',
    amount: -200,
    description: 'Giveaway Entry',
    date: '2024-03-14T15:45:00Z',
    status: 'completed',
    category: 'giveaway',
  },
  {
    id: '3',
    type: 'earn',
    amount: 1000,
    description: 'Referral Bonus',
    date: '2024-03-13T09:15:00Z',
    status: 'completed',
    category: 'referral',
  },
];

export default function WalletScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { data: userWallet } = useGetWalletQuery(
    {},
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );
  const wallet = userWallet?.data;
  const [baseCurrencyRewardAmount, setBaseCurrencyWalletAmount] =
    useState<number>();
  const { data: transactionFx, refetch } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    refetch();
    if (wallet?.usdValueEquivalent && transactionFx?.nairaToDollar) {
      const nairaEquivalent =
        Number(wallet?.usdValueEquivalent) *
        Number(transactionFx?.nairaToDollar);        
        setBaseCurrencyWalletAmount(nairaEquivalent)

    }
  }, [transactionFx, wallet, refetch]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderWalletSummaryCard = () => (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.walletSummaryCard}
    >
    <LinearGradient
      start={{ x: 0.1, y: 0.2 }}
      end={{ x: 0.8, y: 0.2 }}
      colors={["#ff6454", "rgba(191.5, 50, 106, 1)"]}
      style={styles.card}
    >
      <View>
        <Text style={styles.title}>Coins balance</Text>

        <View style={styles.rowSpaceBetween}>
          <View style={styles.row}>
            <Image
              style={styles.coinImage}
              source={require("../../assets/images/coin-794.png")}
            />
            <Text style={styles.balance}>
              {Number(wallet?.coinBalance).toFixed(2)}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/(screens)/get-coins")}
            style={styles.row}
          >
            <Text style={styles.getCoins}>Get Coins</Text>
            <ArrowRight color="white" size={14}/>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowSpaceBetween}>
          <View style={styles.rewardGroup}>
            <Pressable onPress={() => router.push("/(screens)/reward")}>
              <Text style={styles.rewardTitle}>Giveaway rewards</Text>
              <Text style={styles.rewardAmount}>
                {wallet?.currency}
                {textFormatter(
                  String(baseCurrencyRewardAmount),
                  true,
                  true
                )}
              </Text>
            </Pressable>
            <ArrowRight color="white" size={13} />
          </View>

          <View style={styles.verticalDivider} />

          <Pressable
            onPress={() => Alert.alert("Rewards not availbale")}
            style={styles.row}
          >
            <Text style={styles.getCoins}>Other rewards</Text>
            <ArrowRight color="white" size={13} />
          </Pressable>
        </View>
      </View>

      <Image
        source={require("../../assets/images/card-overlay.png")}
        style={styles.overlayTop}
      />
      <Image
        source={require("../../assets/images/card-overlay.png")}
        style={styles.overlayBottom}
      />
    </LinearGradient>
    </Animated.View>
  );

  const renderTransactionHistory = () => (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={styles.transactionsSection}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <History size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            /* Handle view all */
          }}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {mockTransactions.map((transaction, index) => (
        <Animated.View
          key={transaction.id}
          entering={FadeInRight.delay(index * 50).springify()}
          style={[styles.transactionItem, { backgroundColor: colors.card }]}
        >
          <View style={styles.transactionIcon}>
            {transaction.type === 'earn' ? (
              <Plus size={20} color={colors.success} />
            ) : (
              <Minus size={20} color={colors.error} />
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text
              style={[styles.transactionDescription, { color: colors.text }]}
            >
              {transaction.description}
            </Text>
            <Text
              style={[styles.transactionDate, { color: colors.textSecondary }]}
            >
              {new Date(transaction.date).toLocaleDateString()}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              {
                color:
                  transaction.type === 'earn' ? colors.success : colors.error,
              },
            ]}
          >
            {transaction.type === 'earn' ? '+' : ''}
            {transaction.amount}
          </Text>
        </Animated.View>
      ))}
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderWalletSummaryCard()}
        {renderTransactionHistory()}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  walletSummaryCard: {
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  walletSummaryGradient: {
    padding: 20,
  },
  coinsSection: {
    marginBottom: 16,
  },
  cardLabel: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    opacity: 0.8,
  },
  coinsDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  coinsAmount: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  horizontalSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 16,
  },
  rewardsSummarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  rewardValue: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: '100%',
    marginHorizontal: 10,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  card: {
    borderRadius: 13.87,
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  coinImage: {
    width: 34,
    height: 34,
    marginLeft: -5,
  },
  balance: {
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    marginLeft: -3,
  },
  getCoins: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  divider: {
    borderWidth: 0.5,
    opacity: 0.5,
    borderColor: "white",
    marginTop: 35,
  },
  rewardGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rewardTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  rewardAmount: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  verticalDivider: {
    height: "70%",
    marginHorizontal: 12,
    opacity: 0.4,
    borderWidth: 0.5,
    borderColor: "white",
  },
  overlayTop: {
    position: "absolute",
    height: 48.51,
    width: 195.08,
    top: 0,
    right: 0,
  },
  overlayBottom: {
    position: "absolute",
    height: 48.51,
    width: 195.08,
    bottom: 0,
    right: 0,
  },
});
