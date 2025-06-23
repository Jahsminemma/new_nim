import React, { useEffect, useState } from "react";
import {
  useFetchBeneficiaryQuery,
  useGetDataPackagesQuery,
  usePlaceOrderMutation,
} from "../../../../redux/slice/servicesApiSlice";
import {
  Dimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useGetTransactionFXQuery } from "../../../../redux/slice/walletsApiSplice";
import { router } from "expo-router";
import { calculateTransactionFee, getNetworkProvider, textFormatter } from "@/utils";
import { useHandleMutationError } from "@/hooks/useError";
import { IOrderDetailItem, OrderRequest } from "../types";
import BeneficiaryInput from "@/components/ui/BeneficiaryInput";
import ServiceProvider from "@/components/ui/ServiceProvider";
import { PageLoadingModal } from "@/components/ui/PageLoadingModal";
import PaymentModal from "@/components/ui/PaymentModal";
import { Colors } from "react-native/Libraries/NewAppScreen";
import ScreenHeaderLayout from "@/components/layout/ScreenHeaderLayout";
import { useTheme } from "@/hooks/useTheme";

interface IPriceTag {
  variation_amount: string;
  variation_code: string;
  name: string;
}

const Index = () => {
  const [number, setNumber] = useState<string | null>("");
  const [billAmount, setBillAmount] = useState("");
  const [amount, setAmount] = useState<number>();
  const [transFee, setTrasFee] = useState<number>();
  const [open, setOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [variationCode, setVariationCode] = useState("");
  const { data: beneficiary, isSuccess } = useFetchBeneficiaryQuery("DATA");
  const [pin, setPin] = useState("");
  const [activeProvider, setActiveProvider] = useState<{
    productCode: string;
    name: string;
  }>({ name: "MTN", productCode: "mtn-data" });


  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [cachedPackages, setCachedPackages] = useState<{
    [key: string]: any[];
  }>({});

  const { colors } = useTheme();

  const { data: dataPackage, isSuccess: isDataPackageSuccess } =
    useGetDataPackagesQuery(activeProvider.productCode, {
      skip: !activeProvider.productCode,
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (isDataPackageSuccess && activeProvider.productCode) {
      const data = dataPackage?.data || [];
      setCachedPackages((prevCache) => ({
        ...prevCache,
        [activeProvider.productCode]: data,
      }));
    }
  }, [dataPackage, isDataPackageSuccess, activeProvider]);

  useEffect(() => {
    if (!cachedPackages[activeProvider.productCode]) {
      setCachedPackages((prevCache) => ({
        ...prevCache,
        [activeProvider.productCode]: dataPackage?.data || [],
      }));
    }
  }, [activeProvider.productCode, dataPackage]);

  const currentPackages = cachedPackages[activeProvider.productCode] || [];

  useEffect(() => {
    const networkProvider = getNetworkProvider(number as string, "DATA");
    setActiveProvider(networkProvider as typeof activeProvider);
  }, [number]);

  const handleDataPayload: OrderRequest = {
    category: "DATA",
    provider: activeProvider.productCode,
    amount: Number(amount),
    fee: Number(transFee),
    phoneNumber: String(number).replace(/\s+/g, ''),
    narration: "",
    pin,
    saveBeneficiary: true,
    data: {
      serviceID: activeProvider.productCode,
      billersCode: String(number),
      variationCode: variationCode,
      amount: Number(billAmount),
      phone: String(number).replace(/\s+/g, ''),
    },
  };

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const handlePayment = async () => {
    try {
      const paymentResponse = await placeOrder(handleDataPayload).unwrap();
      router.replace({pathname: '/(screens)/billServices/transaction/success', params: { amount: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`, response: JSON.stringify(paymentResponse.data), returnPath: "/(screens)/reward", message: "Successful"}})
    } catch (error) {
      setPin("")
      useHandleMutationError(error);
    }
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

  const { width } = Dimensions.get("screen");
  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);
  const totalAmount = +billAmount + Number(nairaFee);

  const orderDetailLists: IOrderDetailItem[] = [
    { label: "Mobile number", value: `${number}` },
    { label: "Data bundle", value: `${variationCode}` },
    { label: "Amount", value: `₦${textFormatter(billAmount, true, true)}` },
    { label: "Transaction fee", value: `₦${nairaFee}` },
    {
      label: "Total amount",
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  return (
    <ScreenHeaderLayout headerTitle="Data">
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <BeneficiaryInput
            open={open}
            setOpen={setOpen}
            value={number}
            setValue={setNumber}
            beneficiaries={beneficiaries}
          />
        </View>
        <View style={styles.serviceProviderContainer}>
          <ServiceProvider
            activeIcon={activeProvider}
            setActiveIcon={(val) => setActiveProvider(val)}
            serviceCategory={'DATA'}
            setPreferredPackage={() => {}}
          />
        </View>
        <View style={styles.packageContainer}>
          <View style={[styles.packageInnerContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.packageTitle, { color: colors.text }]}>
              Top up Data
            </Text>
            <View style={styles.packageGrid}>
              {currentPackages.length === 0 && (
                <Text style={styles.loadingText}>
                  Loading...
                </Text>
              )}
              {currentPackages.map((price: IPriceTag, index: number) => (
                <TouchableOpacity
                  onPress={() => {
                    setBillAmount(price.variation_amount);
                    setVariationCode(price.variation_code);
                    if (number && activeProvider.productCode) {
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
      <PageLoadingModal visible={isLoading} />
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
    </ScreenHeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 10,
  },
  serviceProviderContainer: {
    marginTop: 20,
    zIndex: -1,
  },
  packageContainer: {
    marginTop: 20,
    zIndex: -1,
  },
  packageInnerContainer: {
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
  packageButtonText: {
    fontSize: 18,
    paddingBottom: 8,
  },
  nairaSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  packageButtonSubtext: {
    fontSize: 14,
  },
  
});

export default Index;
