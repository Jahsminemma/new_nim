import React, { useEffect, useState } from 'react';
import {
  OrderRequest,
  useCableInfoEnquiryQuery,
  useFetchBeneficiaryQuery,
  useGetCableTvPackagesQuery,
  usePlaceOrderMutation,
} from '../../../../redux/slice/servicesApiSlice';
import {
  Dimensions,
  Platform,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGetTransactionFXQuery } from '../../../../redux/slice/walletsApiSplice';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import BeneficiaryInput from '@/components/ui/BeneficiaryInput';
import { PageLoadingModal } from '@/components/ui/PageLoadingModal';
import ServiceProvider from '@/components/ui/ServiceProvider';
import { useHandleMutationError } from '@/hooks/useError';
import { textFormatter, calculateTransactionFee } from '@/utils';
import { IOrderDetailItem } from '../types';
import PaymentModal from '@/components/ui/PaymentModal';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import ScreenHeaderLayout from '@/components/layout/ScreenHeaderLayout';

interface IPriceTag {
  variation_amount: string;
  variation_code: string;
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
  const [variationCode, setVariationCode] = useState('');
  const { data: beneficiary, isSuccess } = useFetchBeneficiaryQuery('CABLETV');
  const { user } = useSelector((state: any) => state.auth);
  const [pin, setPin] = useState('');
  const [customerInfo, setCustomerInfo] = useState();
  const [subscriptionType, setSubscriptionType] = useState<'change' | 'renew'>(
    'change'
  );
  const [showInputBtn, setShowInputBtn] = useState(false);
  const [activeProvider, setActiveProvider] = useState<{
    productCode: string;
    name: string;
  }>({ name: 'DSTV', productCode: 'dstv' });

  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [allowSNValidation, setAllowSNValidation] = useState(false);
  const [isSmartCardNumberValid, setIsSmartCardNumberValid] = useState<
    boolean | null
  >(null);

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [cachedPackages, setCachedPackages] = useState<{
    [key: string]: any[];
  }>({});

  const { data: cablePackage, isSuccess: isCablePackageSuccess } =
    useGetCableTvPackagesQuery(activeProvider.productCode, {
      skip: !activeProvider.productCode,
      refetchOnMountOrArgChange: true,
    });

  const { data: cableInfoEnquiry, isFetching } = useCableInfoEnquiryQuery(
    {
      serviceID: activeProvider.productCode,
      smartCard: String(number),
    },
    {
      skip:
        !allowSNValidation ||
        String(number).length < 10 ||
        !activeProvider.productCode,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (activeProvider.productCode) {
      setIsSmartCardNumberValid(false);
      setShowInputBtn(false);
      if (!isFetching && cableInfoEnquiry?.data?.Customer_Name) {
        setIsSmartCardNumberValid(true);
        setCustomerInfo(cableInfoEnquiry?.data);
        if (
          activeProvider.productCode === 'gotv' ||
          activeProvider.productCode === 'dstv'
        )
          setShowInputBtn(true);
      }
    }
  }, [allowSNValidation, customerInfo, isFetching]);

  useEffect(() => {
    if (isCablePackageSuccess && activeProvider.productCode) {
      const data = cablePackage?.data || [];
      setCachedPackages((prevCache) => ({
        ...prevCache,
        [activeProvider.productCode]: data,
      }));
    }
  }, [cablePackage, isCablePackageSuccess, activeProvider]);

  useEffect(() => {
    if (!cachedPackages[activeProvider.productCode]) {
      setCachedPackages((prevCache) => ({
        ...prevCache,
        [activeProvider.productCode]: cablePackage?.data || [],
      }));
    }
  }, [activeProvider.productCode, cablePackage]);

  const currentPackages = cachedPackages[activeProvider.productCode] || [];

  const handlePayload: OrderRequest = {
    category: 'CABLE',
    provider: activeProvider.productCode,
    amount: Number(amount),
    fee: Number(transFee),
    phoneNumber: String(user?.phoneNumber?.replace('+234', '0')),
    narration: '',
    pin,
    saveBeneficiary: true,
    cable: {
      serviceID: activeProvider.productCode.trim(),
      billersCode: String(number),
      variationCode: variationCode,
      amount: Number(billAmount),
      phone: String(user?.phoneNumber?.replace('+234', '0')),
      subscriptionType: subscriptionType,
    },
  };

  useEffect(() => {
    if (activeProvider.productCode && String(number).length > 5) {
      setAllowSNValidation(true);
    }
  }, [number, cachedPackages]);

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  if (activeProvider.productCode === 'showmax') {
    delete handlePayload.cable?.subscriptionType;
    delete handlePayload.cable?.phone;
  }

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

  useEffect(() => {
    if (beneficiary?.data && isSuccess) {
      const beneficiaryData = beneficiary?.data.map(
        (item: { serviceId: string; phone: string }) => {
          return {
            serviceId: item.serviceId,
            label: `${item.billersCode} ${item.serviceId}`,
            value: item.billersCode,
          };
        }
      );
      setBeneficiaries(beneficiaryData);
      setNumber(beneficiaryData[0]?.value);
    }
  }, [beneficiary]);

  useEffect(() => {
    const nairaToDollar = Number(transactionFx?.nairaToDollar);
    const usdValue = Number(billAmount) / Number(nairaToDollar);
    const fee = calculateTransactionFee(
      Number(billAmount),
      nairaToDollar,
      Number(transactionFx?.percentagePerWithdrawal)
    );
    setAmount(Number(usdValue));
    setTrasFee(fee);
  }, [billAmount]);

  const { width } = Dimensions.get('screen');
  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);
  const totalAmount = +billAmount + Number(nairaFee);

  const orderDetailLists: IOrderDetailItem[] = [
    { label: 'Smartcard number', value: `${number}` },
    {
      label: 'Package',
      value: `${
        variationCode ||
        (customerInfo && customerInfo?.Current_Bouquet?.split('+')[0])
      }`,
    },
    { label: 'Amount', value: `₦${textFormatter(billAmount, true, true)}` },
    { label: 'Transaction fee', value: `₦${nairaFee}` },
    {
      label: 'Total amount',
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  const smartCardNumberBorderColor =
    isSmartCardNumberValid === null
      ? ''
      : number
      ? isSmartCardNumberValid
        ? '#27AE60'
        : '#FF4B55'
      : '';

  return (
    <ScreenHeaderLayout headerTitle="Cable TV">
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <ServiceProvider
          activeIcon={activeProvider}
          setActiveIcon={(val) => {
            setActiveProvider(val);
          }}
          serviceCategory={'CABLE-TV'}
          setPreferredPackage={() => {}}
        />
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <BeneficiaryInput
            open={open}
            setOpen={setOpen}
            value={number || ''}
            showInputBtn={showInputBtn}
            onRenew={() => {
              if (customerInfo && customerInfo.Customer_Name) {
                setBillAmount(String(customerInfo.Renewal_Amount));
                setVariationCode('');
                setSubscriptionType('renew');
                if (
                  number &&
                  activeProvider.productCode &&
                  customerInfo?.Customer_Name &&
                  !cableInfoEnquiry.data.content?.error
                ) {
                  setShowOrderDetails(true);
                }
              }
            }}
            onSelect={() => {
              setAllowSNValidation(true);
            }}
            setValue={(value) => {
              setNumber(value);
            }}
            beneficiaries={beneficiaries}
            onPointerLeaveCapture={() => {
              setAllowSNValidation(true);
            }}
            onTouchMove={() => {
              setAllowSNValidation(true);
            }}
            onBlur={() => {
              setAllowSNValidation(true);
            }}
          />
        </View>
        <View style={styles.validationContainer}>
          {number && isSmartCardNumberValid !== null && (
            <View
              style={[
                styles.validationWrapper,
                {
                  alignItems: isSmartCardNumberValid ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              {isFetching ? (
                <Text style={styles.verifyingText}>Verifying account...</Text>
              ) : (
                <View>
                  <Text
                    style={[
                      styles.validationText,
                      !isSmartCardNumberValid && styles.errorText,
                    ]}
                  >
                    {!isSmartCardNumberValid && cableInfoEnquiry?.data?.error}
                  </Text>
                  {isSmartCardNumberValid && (
                    <View style={styles.customerInfoContainer}>
                      <CheckCircle2 size={16} color={colors.success} />
                      <Text style={[styles.customerName, styles.successText]}>
                        {customerInfo.Customer_Name}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          <View
            onTouchStart={() => setOpen(false)}
            style={[styles.packageContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.packageTitle, { color: colors.text }]}>
              {activeProvider.name} package
            </Text>
            <View style={styles.packageGrid}>
              {currentPackages.length === 0 && (
                <Text style={styles.loadingText}>Loading...</Text>
              )}
              {currentPackages.map((price: IPriceTag, index: number) => (
                <TouchableOpacity
                  onPress={() => {
                    setBillAmount(price.variation_amount);
                    setVariationCode(price.variation_code);
                    setAllowSNValidation(true);
                    setOpen(false);
                    if (
                      number &&
                      activeProvider.productCode &&
                      customerInfo?.Customer_Name &&
                      !cableInfoEnquiry.data.content?.error
                    ) {
                      setShowOrderDetails(true);
                    }
                  }}
                  key={index}
                  style={[styles.packageButton, { width: width / 2.5 }]}
                >
                  <Text style={[styles.packageButtonText, { color: colors.text }]}>
                    <Text style={styles.nairaSymbol}>₦</Text>
                    {textFormatter(price.variation_amount, true)}
                  </Text>
                  <Text style={[styles.packageButtonSubtext, { color: colors.textSecondary }]}>
                    {price.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <PaymentModal
        visible={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        onClickPay={handlePayment}
        orderItemDetails={orderDetailLists}
        orderDetailLabel={`₦${textFormatter(String(totalAmount), true, true)}`}
        orderDetailTitle="Payment"
        pin={pin}
        setPin={setPin}
        label={`₦${textFormatter(billAmount, true, true)}`}
      />
      <PageLoadingModal visible={isLoading} />
    </ScreenHeaderLayout>
  );
};

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
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollContainer: {
    flex: 1,
  },
  inputContainer: {
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 10,
  },
  validationContainer: {
    marginTop: 40,
    zIndex: -1,
  },
  validationWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    bottom: 4,
  },
  verifyingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  validationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  customerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  packageContainer: {
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  packageButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 92,
    backgroundColor: '#ff645410',
  },
  packageAmount: {
    fontSize: 18,
    paddingBottom: 8,
  },
  nairaSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  packageName: {
    fontSize: 14,
  },
  errorText: {
    color: '#FF4B55',
  },
  successText: {
    color: '#27AE60',
  },
  packageButtonText: {
    fontSize: 18,
    paddingBottom: 8,
  },
  packageButtonSubtext: {
    fontSize: 14,
    color: '#aaa',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  }
});

export default Index;
