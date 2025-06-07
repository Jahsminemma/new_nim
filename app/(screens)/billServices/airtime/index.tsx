import React, { useEffect, useState } from 'react';
import {
  useFetchBeneficiaryQuery,
  usePlaceOrderMutation,
} from '../../../../redux/slice/servicesApiSlice';

import {
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Platform,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useGetTransactionFXQuery } from '../../../../redux/slice/walletsApiSplice';
import { router, Href } from 'expo-router';
import { useHandleMutationError } from '@/hooks/useError';
import {
  calculateTransactionFee,
  getNetworkProvider,
  textFormatter,
} from '@/utils';
import { IOrderDetailItem, OrderRequest } from '../types';
import BeneficiaryInput from '@/components/ui/BeneficiaryInput';
import ServiceProvider from '@/components/ui/ServiceProvider';
import CustomTextInput from '@/components/ui/CustomTextInput';
import { PageLoadingModal } from '@/components/ui/PageLoadingModal';
import PaymentModal from '@/components/ui/PaymentModal';
import { useTheme } from '@/hooks/useTheme';
import ScreenHeaderLayout from '@/components/ui/ScreenHeaderLayout';

interface IPriceTag {
  price: string;
  name: string;
}

const Index = () => {
  const { colors } = useTheme();
  const [number, setNumber] = useState<string | null>('');
  const [billAmount, setBillAmount] = useState('');
  const [amount, setAmount] = useState<number>();
  const [transFee, setTrasFee] = useState<number>();
  const [open, setOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const { data: beneficiary, isSuccess } = useFetchBeneficiaryQuery('AIRTIME');
  const [pin, setPin] = useState('');
  const [activeProvider, setActiveProvider] = useState<{ productCode: string }>(
    { productCode: '' }
  );
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [priceVariations] = useState<IPriceTag[]>([
    { price: '100', name: 'Pay ₦100' },
    { price: '200', name: 'Pay ₦200' },
    { price: '500', name: 'Pay ₦500' },
    { price: '1000', name: 'Pay ₦1,000' },
    { price: '2000', name: 'Pay ₦2,000' },
    { price: '3000', name: 'Pay ₦3,000' },
    { price: '5000', name: 'Pay ₦5,000' },
  ]);

  const handleAirtimePayload: OrderRequest = {
    category: 'AIRTIME',
    provider: activeProvider.productCode,
    amount: Number(amount),
    fee: Number(transFee),
    phoneNumber: String(number).replace(/\s+/g, ''),
    narration: '',
    pin,
    saveBeneficiary: true,
    airtime: {
      serviceID: activeProvider.productCode,
      amount: Number(billAmount),
      phone: String(number).replace(/\s+/g, ''),
    },
  };

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const handleAirtimePayment = async () => {
    try {
      const paymentResponse = await placeOrder(handleAirtimePayload).unwrap();
      router.replace({
        pathname: '/(screens)/billServices/transaction/success' as Href<string>,
        params: {
          amount: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
          response: JSON.stringify(paymentResponse.data),
          returnPath: '/(screens)/reward',
          message: 'Successful',
        } as any,
      });
    } catch (error) {
      setPin('');
      useHandleMutationError(error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (beneficiary?.data && isSuccess) {
      const beneficiaryData = beneficiary?.data.map(
        (item: { serviceId: string; phone: string }) => {
          return {
            label: `${item.phone} ${item.serviceId}`,
            value: item.phone,
          };
        }
      );
      setBeneficiaries(beneficiaryData);
      if (beneficiaryData && beneficiaryData.length > 0) {
        setNumber(beneficiaryData[0]?.value);
      }
    }
  }, [beneficiary, isSuccess]);

  useEffect(() => {
    const nairaToDollar = Number(transactionFx?.nairaToDollar);
    const usdValue = (Number(billAmount) / Number(nairaToDollar)).toFixed(4);
    const fee = calculateTransactionFee(
      Number(billAmount),
      nairaToDollar,
      Number(transactionFx?.percentagePerWithdrawal)
    );
    setAmount(Number(usdValue));
    setTrasFee(fee);
  }, [billAmount, transactionFx]);

  const { width } = Dimensions.get('screen');
  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);

  const totalAmount = +billAmount + Number(nairaFee);

  const orderDetailLists: IOrderDetailItem[] = [
    { label: 'Mobile number', value: `${number}` },
    { label: 'Network', value: `${activeProvider.productCode}` },
    { label: 'Amount', value: `₦${textFormatter(billAmount, true, true)}` },
    { label: 'Transaction fee', value: `₦${nairaFee}` },
    {
      label: 'Total amount',
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  useEffect(() => {
    if (number) {
      const networkProvider = getNetworkProvider(number, 'AIRTIME');
      if (networkProvider) {
        setActiveProvider(networkProvider as any);
      }
    }
  }, [number]);

  console.log(orderDetailLists);

  return (
    <ScreenHeaderLayout headerTitle="Airtime Top up">
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.inputSectionContainer}>
          <BeneficiaryInput
            open={open}
            setOpen={setOpen}
            value={number || ''}
            setValue={setNumber}
            beneficiaries={beneficiaries}
            colors={colors.background}
          />
        </View>
        <ServiceProvider
          activeIcon={activeProvider}
          setActiveIcon={(val: { productCode: string }) =>
            setActiveProvider(val as any)
          }
          serviceCategory={'AIRTIME'}
          setPreferredPackage={() => {}}
          colors={colors}
        />
        <View style={{ marginTop: 20, zIndex: -1989999976466 }}>
          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 10,
              paddingVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            <FlatList
              data={[
                { type: 'input' },
                { type: 'horizontalLine' },
                ...priceVariations,
              ]}
              numColumns={3}
              contentContainerStyle={{ gap: 3 }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                if (item.type === 'input') {
                  return (
                    <View style={{ width: (width / 4) * 2.2, margin: 5 }}>
                      <CustomTextInput
                        borderColor="transparent"
                        color={colors.text}
                        customLeftIcon={
                          <Text style={{ color: colors.text }}>₦</Text>
                        }
                        placeholder="50 - 500, 000"
                        label={''}
                        inputType={'numeric'}
                        value={textFormatter(billAmount, true)}
                        setValue={(val) => setBillAmount(val)}
                      />
                      <View
                        style={{
                          borderBottomColor: colors.textSecondary,
                          borderBottomWidth: 0.5,
                          top: 10,
                        }}
                      />
                    </View>
                  );
                }

                if (item.type === 'horizontalLine') {
                  return (
                    <View
                      style={{
                        borderBottomColor: 'transparent',
                        borderBottomWidth: 0.5,
                        width: 10,
                        top: 10,
                      }}
                    />
                  );
                }

                return (
                  <TouchableOpacity
                    onPress={() => {
                      setBillAmount(item.price);
                      if (number && activeProvider.productCode) {
                        setShowOrderDetails(true);
                      }
                    }}
                    style={{
                      width: width / 4,
                      margin: 10,
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 12,
                      height: 80,
                      backgroundColor: '#ff645410',
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: colors.text }}>
                      <Text style={{ fontWeight: 'bold', color: colors.text }}>
                        ₦
                      </Text>
                      {textFormatter(item.price, true)}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: colors.textSecondary,
                        fontSize: 14,
                        bottom: 3,
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            (!billAmount || !number || !activeProvider.productCode) &&
              styles.buttonDisabled,
          ]}
          onPress={() => setShowOrderDetails(true)}
          disabled={!billAmount || !number || !activeProvider.productCode}
        >
          <Text style={{ color: '#fff' }}>Continue</Text>
        </TouchableOpacity>
        <PageLoadingModal visible={isLoading} />
        <PaymentModal
          height={Platform.OS === 'ios' ? 0.55 : 0.55}
          visible={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          onClickPay={handleAirtimePayment}
          orderItemDetails={orderDetailLists}
          orderDetailLabel={`₦${textFormatter(
            String(totalAmount),
            true,
            true
          )}`}
          orderDetailTitle="Payment"
          pin={pin}
          setPin={setPin}
          label={`₦${textFormatter(billAmount, true, true)}`}
        />
      </ScrollView>
    </ScreenHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputSectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  serviceProviderContainer: {
    marginTop: 20,
    zIndex: 1,
    paddingHorizontal: 20,
  },
  priceVariationsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  priceVariationsInner: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceVariationsListContent: {
    justifyContent: 'space-between',
  },
  customTextInputWrapper: {
    width: ((Dimensions.get('screen').width - 40 - 30 - 12) / 3) * 2 + 12,
    marginHorizontal: 0,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nairaIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  textInputUnderline: {
    height: 1,
    marginTop: 5,
    flex: 1,
  },
  horizontalLine: {
    width: 12,
  },
  priceTagButton: {
    width: (Dimensions.get('screen').width - 40 - 30 - 12) / 3,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  priceTagAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nairaSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  priceTagName: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default Index;
