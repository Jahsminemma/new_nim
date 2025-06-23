import React, { useEffect, useState } from 'react';
import {
  useFetchBeneficiaryQuery,
  useGetActiveProvidersQuery,
  useMeterNumberValidationQuery,
  usePlaceOrderMutation,
} from '../../../../redux/slice/servicesApiSlice';
import {
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGetTransactionFXQuery } from '../../../../redux/slice/walletsApiSplice';
import PaymantModal from '../../../../components/ui/PaymentModal';
import { router } from 'expo-router';
import { IOrderDetailItem, OrderRequest } from '../types';
import { calculateTransactionFee, textFormatter } from '@/utils';
import { useHandleMutationError } from '@/hooks/useError';
import ScreenHeaderLayout from '@/components/layout/ScreenHeaderLayout';
import { PageLoadingModal } from '@/components/ui/PageLoadingModal';
import CustomTextInput from '@/components/ui/CustomTextInput';
import BeneficiaryInput from '@/components/ui/ECServiceBeneficiaryInput';
import CustomSelectDropDown from '@/components/ui/CustomSelectDropDown';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { CheckCircle } from 'lucide-react-native';
import PaymentModal from '../../../../components/ui/PaymentModal';

interface IPriceTag {
  price: string;
  name: string;
}

type FlatListItem = IPriceTag | { type: 'input' } | { type: 'horizontalLine' };

const { width } = Dimensions.get('window');

const Index = () => {
  const [number, setNumber] = useState<string | null>('');
  const [billAmount, setBillAmount] = useState('');
  const [amount, setAmount] = useState<number>();
  const [transFee, setTrasFee] = useState<number>();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const { data: beneficiary, isSuccess } =
    useFetchBeneficiaryQuery('ELECTRICITY');
  const [pin, setPin] = useState('');
  const [serviceProvider, setServiceProvider] = useState<any>();
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const activeProviders = useGetActiveProvidersQuery('ELECTRICITY');

  const [refreshing, setRefreshing] = useState(false);

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [priceVariations] = useState<IPriceTag[]>([
    { price: '1000', name: 'Pay ₦1,000' },
    { price: '1500', name: 'Pay ₦1,500' },
    { price: '2000', name: 'Pay ₦2,000' },
    { price: '3000', name: 'Pay ₦3,000' },
    { price: '5000', name: 'Pay ₦5,000' },
    { price: '10000', name: 'Pay ₦10,000' },
    { price: '20000', name: 'Pay ₦20,000' },
  ]);

  const [billProvider, setBillProvider] = useState<{
    name: string;
    value: string;
  }>();

  const handlePayload: OrderRequest = {
    category: 'ELECTRICITY',
    provider: serviceProvider?.value,
    amount: Number(amount),
    fee: Number(transFee),
    phoneNumber: String(user?.phoneNumber?.replace('+234', '0')),
    narration: '',
    pin,
    saveBeneficiary: true,
    electricity: {
      serviceID: serviceProvider?.value,
      billersCode: String(number),
      variationCode: billProvider?.value as string,
      amount: Number(billAmount),
      phone: String(user?.phoneNumber?.replace('+234', '0')),
    },
  };
  const [allowMNValidation, setAllowMNValidation] = useState(false);
  const [isMeterNumberValid, setIsMeterNumberValid] = useState<boolean | null>(
    null
  );

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const handlePayment = async () => {
    try {
      const paymentResponse = await placeOrder(handlePayload).unwrap();
      router.replace({
        pathname: '/(screens)/billServices/transaction/success',
        params: {
          amount: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
          response: JSON.stringify(paymentResponse.data),
          returnPath: '/(screens)/reward',
          message: 'Successful',
        },
      });
    } catch (error) {
      setPin('');
      useHandleMutationError(error);
    }
  };

  const { data: meterNumberValidation, isFetching } =
    useMeterNumberValidationQuery(
      {
        serviceID: serviceProvider?.value,
        billersCode: String(number),
        type: billProvider?.value as string,
      },
      {
        skip:
          !number ||
          !serviceProvider?.value ||
          !billProvider?.value ||
          !allowMNValidation,
      }
    );

  useEffect(() => {
    if (serviceProvider && billProvider) {
      setIsMeterNumberValid(false);
      if (!isFetching && meterNumberValidation?.data?.Customer_Name)
        setIsMeterNumberValid(true);
    }
  }, [meterNumberValidation, allowMNValidation, isFetching]);

  const meterNumberBorderColor =
    isMeterNumberValid === null
      ? ''
      : number
      ? isMeterNumberValid
        ? '#27AE60'
        : '#FF4B55'
      : '';

  useEffect(() => {
    if (serviceProvider?.value && String(number).length > 9) {
      setAllowMNValidation(true);
    }
  }, [number, billProvider?.value, serviceProvider?.value]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (beneficiary?.data && isSuccess) {
      const beneficiaryData = beneficiary?.data.map(
        (item: {
          serviceId: string;
          billersCode: string;
          variationCode: string;
        }) => {
          return {
            label: `${item.billersCode} ${item.serviceId}`,
            value: item.billersCode,
            serviceId: item.serviceId,
            variationCode: item.variationCode,
          };
        }
      );
      setBeneficiaries(beneficiaryData);
      setNumber(beneficiaryData[0]?.value);
      setBillProvider(
        billProviderOptions.find(
          (item) => item?.value === beneficiaryData[0]?.variationCode
        )
      );
    }
  }, [beneficiary]);

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
  }, [billAmount]);

  useEffect(() => {
    const saveProvider = activeProviders.data?.data?.find(
      (item: Record<string, string>) =>
        item.productCode === beneficiaries[0]?.serviceId
    );
    setServiceProvider({ ...saveProvider, value: saveProvider?.productCode });
  }, [activeProviders, beneficiaries]);

  const { colors } = useTheme();
  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);
  const totalAmount = +billAmount + Number(nairaFee);

  const orderDetailLists: IOrderDetailItem[] = [
    { label: 'Meter number', value: `${number}` },
    { label: 'Provider', value: `${serviceProvider?.productCode}` },
    { label: 'Amount', value: `₦${textFormatter(billAmount, true, true)}` },
    { label: 'Transaction fee', value: `₦${nairaFee}` },
    {
      label: 'Total amount',
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  const billProviderOptions = [
    {
      name: 'Postpaid',
      value: 'postpaid',
    },
    {
      name: 'Prepaid',
      value: 'prepaid',
    },
  ];

  const disableButton =
    String(number).length > 7 &&
    billProvider &&
    Number(billAmount) > 499 &&
    serviceProvider?.productCode &&
    isMeterNumberValid
      ? false
      : true;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 10,
      borderRadius: 10,
      marginTop: 15,
    },
    cardContent: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    divider: {
      marginTop: 6,
      opacity: 0.3,
      borderColor: 'grey',
      borderBottomWidth: 0.7,
    },
    beneficiaryContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 10,
      marginTop: 20,
      borderRadius: 10,
    },
    validationContainer: {
      marginTop: 40,
      zIndex: -1989999976466,
    },
    validationText: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    validationSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    validationSuccessText: {
      color: '#27AE60',
      fontSize: 13,
      fontFamily: 'Inter-Medium',
    },
    amountContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 10,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    amountInput: {
      width: (width / 4) * 2,
      margin: 5,
    },
    amountError: {
      borderBottomColor: '#777',
      borderBottomWidth: 0.5,
      width: width * 0.43,
    },
    amountErrorText: {
      color: '#FF4B55',
      marginHorizontal: 16,
      fontSize: 12,
      fontFamily: 'Inter-Regular',
    },
    amountButton: {
      width: width / 3.8,
      margin: 5,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#ff645410',
      height: 80,
    },
    amountButtonText: {
      fontWeight: '800',
      fontSize: 20,
      paddingBottom: 4,
      fontFamily: 'Inter-Bold',
    },
    amountButtonLabel: {
      color: '#aaa',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    currencySymbol: {
      fontWeight: '700',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    relative: {
      position: 'relative',
    },
    my2: {
      marginVertical: 8,
    },
    flexCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roundedLg: {
      borderRadius: 8,
    },
    bgTint: {
      backgroundColor: '#ff645410',
    },
    h20: {
      height: 80,
    },
    inputContainer: {
      marginTop: 1,
    },
    input: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 0,
      borderRadius: 5,
      marginBottom: 10,
      fontSize: 25,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    dropdown: {
      height: 20,
      borderWidth: 0,
      borderRadius: 0,
      paddingHorizontal: 8,
      bottom: 10,
    },
    placeholderStyle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#777',
      fontFamily: 'Inter-Bold',
    },
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      padding: 14,
      marginHorizontal: 20,
      marginTop: 3,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <ScreenHeaderLayout headerTitle={'Electricity'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <CustomSelectDropDown
                label="Select Service Provider"
                isBill
                value={serviceProvider}
                addHeight={0.7}
                data={
                  activeProviders.data &&
                  activeProviders.data?.data.map((provider: any) => ({
                    ...provider,
                    value: provider.productCode,
                  }))
                }
                setValue={(value) => setServiceProvider(value)}
                modalTitle="Choose a Provider"
                isLoading={activeProviders.isLoading}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.cardContent}>
              <CustomSelectDropDown
                isBill
                label="Select Meter Type"
                value={billProvider}
                data={billProviderOptions}
                borderColor="#ccc"
                setValue={(value) => setBillProvider(value)}
              />
            </View>
          </View>
          <View
            onTouchStart={() => setOpen(false)}
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 10,
              marginTop: 20,
              borderRadius: 10,
            }}
            className="relative"
          >
            <BeneficiaryInput
              label={'meter'}
              open={open}
              setOpen={setOpen}
              value={number || ''}
              showInputBtn={false}
              onRenew={() => {
                if (
                  meterNumberValidation.data &&
                  meterNumberValidation.data.Customer_Name
                ) {
                  if (
                    number &&
                    serviceProvider.value &&
                    meterNumberValidation.data.name &&
                    !meterNumberValidation.data?.error
                  ) {
                    setShowOrderDetails(true);
                  }
                }
              }}
              onSelect={() => {
                setAllowMNValidation(true);
              }}
              setValue={(value) => {
                setNumber(value);
              }}
              beneficiaries={beneficiaries}
              onPointerLeaveCapture={() => {
                setAllowMNValidation(true);
              }}
              onTouchMove={() => {
                setAllowMNValidation(true);
              }}
              onBlur={() => {
                setAllowMNValidation(true);
              }}
            />
          </View>
          <View style={styles.validationContainer}>
            {number && isMeterNumberValid !== null && (
              <View
                style={{
                  alignItems: isMeterNumberValid ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 20,
                  paddingBottom: 15,
                  bottom: 4,
                }}
              >
                {isFetching ? (
                  <Text style={styles.validationText}>
                    Verifying account...
                  </Text>
                ) : (
                  <View>
                    <Text
                      style={[
                        styles.validationText,
                        !isMeterNumberValid && {
                          color: meterNumberBorderColor,
                        },
                      ]}
                    >
                      {!isMeterNumberValid &&
                        meterNumberValidation?.data?.error}
                    </Text>
                    {isMeterNumberValid && (
                      <View style={styles.validationSuccess}>
                        <CheckCircle color="green" size={20} />
                        <Text style={styles.validationSuccessText}>
                          {meterNumberValidation.data.Customer_Name}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
          <View
            onTouchStart={() => setOpen(false)}
            style={styles.amountContainer}
          >
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
                          if (number && serviceProvider.productCode) {
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
                        <Text
                          style={{ fontWeight: 'bold', color: colors.text }}
                        >
                          <Text
                            style={{ fontWeight: 'bold', color: colors.text }}
                          >
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
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            (!billAmount || !number || !activeProviders.productCode) &&
              styles.buttonDisabled,
          ]}
          onPress={() => setShowOrderDetails(true)}
          disabled={!billAmount || !number || !activeProviders.productCode}
        >
          <Text style={{ color: '#fff' }}>Continue</Text>
        </TouchableOpacity>
        <PageLoadingModal visible={isLoading} />
        <PaymentModal
          visible={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          onClickPay={handlePayment}
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
      </KeyboardAvoidingView>
    </ScreenHeaderLayout>
  );
};

export default Index;
