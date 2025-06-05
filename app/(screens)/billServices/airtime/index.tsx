import React, { useEffect, useState } from "react";
import {
  useFetchBeneficiaryQuery,
  usePlaceOrderMutation,
} from "../../../../redux/slice/servicesApiSlice";

import {
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Platform,
  View,
  Text,
  ScrollView
} from "react-native";

import { useGetTransactionFXQuery } from "../../../../redux/slice/walletsApiSplice";
import { router } from "expo-router";
import { useHandleMutationError } from "@/hooks/useError";
import { calculateTransactionFee, getNetworkProvider, textFormatter } from "@/utils";
import { IOrderDetailItem, OrderRequest } from "../types";
import BeneficiaryInput from "@/components/ui/BeneficiaryInput";
import ServiceProvider from "@/components/ui/ServiceProvider";
import CustomTextInput from "@/components/ui/CustomTextInput";
import { PageLoadingModal } from "@/components/ui/PageLoadingModal";
import PaymentModal from "@/components/ui/PaymentModal";

interface IPriceTag {
  price: string;
  name: string;
}

const Index = () => {
  const [number, setNumber] = useState<string | null>("");
  const [billAmount, setBillAmount] = useState("");
  const [amount, setAmount] = useState<number>();
  const [transFee, setTrasFee] = useState<number>();
  const [open, setOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const { data: beneficiary, isSuccess } = useFetchBeneficiaryQuery("AIRTIME");
  const [pin, setPin] = useState("");
  const [activeProvider, setActiveProvider] = useState<{ productCode: string }>(
    { productCode: "" }
  );
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: transactionFx } = useGetTransactionFXQuery(
    {},
    { refetchOnFocus: true }
  );

  const [priceVariations] = useState<IPriceTag[]>([
    { price: "100", name: "Pay ₦100" },
    { price: "200", name: "Pay ₦200" },
    { price: "500", name: "Pay ₦500" },
    { price: "1000", name: "Pay ₦1,000" },
    { price: "2000", name: "Pay ₦2,000" },
    { price: "3000", name: "Pay ₦3,000" },
    { price: "5000", name: "Pay ₦5,000" },
  ]);

  const handleAirtimePayload: OrderRequest = {
    category: "AIRTIME",
    provider: activeProvider.productCode,
    amount: Number(amount),
    fee: Number(transFee),
    phoneNumber: String(number).replace(/\s+/g, ""),
    narration: "",
    pin,
    saveBeneficiary: true,
    airtime: {
      serviceID: activeProvider.productCode,
      amount: Number(billAmount),
      phone: String(number).replace(/\s+/g, ""),
    },
  };

  console.log(handleAirtimePayload)

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const handleAirtimePayment = async () => {
    try {
      const paymentResponse = await placeOrder(handleAirtimePayload).unwrap();
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
      setPin("")
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
      const beneficiaryData =
        beneficiary &&
        beneficiary?.data.map((item: { serviceId: string; phone: string }) => {
          return {
            label: `${item.phone} ${item.serviceId}`,
            value: item.phone,
          };
        });
      setBeneficiaries(beneficiaryData);
      setNumber(beneficiaryData[0]?.value);
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

  const { width } = Dimensions.get("screen");
  const nairaFee = (
    Number(transFee) * Number(transactionFx?.nairaToDollar)
  ).toFixed(2);

  const totalAmount = +billAmount + Number(nairaFee);
  

  const orderDetailLists: IOrderDetailItem[] = [
    { label: "Mobile number", value: `${number}` },
    { label: "Network", value: `${activeProvider.productCode}` },
    { label: "Amount", value: `₦${textFormatter(billAmount, true, true)}` },
    { label: "Transaction fee", value: `₦${nairaFee}` },
    {
      label: "Total amount",
      value: `₦${textFormatter(String(totalAmount.toFixed(2)), true)}`,
    },
  ];

  useEffect(() => {
    const networkProvider = getNetworkProvider(number as string, "AIRTIME");
    
    setActiveProvider(networkProvider as typeof activeProvider);
  }, [number]);

  return (
    <ScrollView>
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 20,
          borderRadius: 10,
        }}
        className="relative"
      >
        <BeneficiaryInput
          open={open}
          setOpen={setOpen}
          value={number || ""}
          setValue={setNumber}
          beneficiaries={beneficiaries}
        />
      </View>
      <View style={{ marginTop: 20, zIndex: -1989999976466 }}>
        <ServiceProvider
          activeIcon={activeProvider}
          setActiveIcon={(val) => setActiveProvider(val)}
          serviceCategory={"AIRTIME"}
          setPreferredPackage={() => {}}
        />
      </View>
      <View style={{ marginTop: 20, zIndex: -1989999976466 }}>
        <View
          style={{
            marginHorizontal: 10,
            paddingVertical: 10,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <FlatList
            data={[{ type: "input" }, { type: "horizontalLine" }, ...priceVariations]}
            numColumns={3}
            contentContainerStyle={{gap:3}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              if (item.type === "input") {
                return (
                  <View style={{ width: (width / 4) * 2, margin: 5 }}>
                    <CustomTextInput
                      borderColor="transparent"
                      customLeftIcon={
                        <Text className="font-bold text-lg text-[#777]">
                          ₦
                        </Text>
                      }
                      placeholder="50 - 500, 000"
                      label={""}
                      inputType={"numeric"}
                      value={textFormatter(billAmount, true)}
                      setValue={(val) => setBillAmount(val)}
                    />
                    <View
                      style={{
                        borderBottomColor: "#777",
                        borderBottomWidth: 0.5,
                        top: 10,
                      }}
                    />
                  </View>
                );
              }

              if (item.type === "horizontalLine") {
                return (
                
                    <View
                      style={{
                        borderBottomColor: "transparent",
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
                    margin: 5,
                  }}
                  className={`p-2 flex items-center justify-center rounded-lg bg-[#ff645410] h-20`}
                >
                  <Text className="font-extrabold text-[20px] pb-1">
                    <Text className="font-bold text-base">₦</Text>
                    {textFormatter(item.price, true)}
                  </Text>
                  <Text className="text-[#aaa]">{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
      <PageLoadingModal visible={isLoading} />
      <PaymentModal
        height={Platform.OS === "ios" ? 0.55 : 0.55}
        visible={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        onClickPay={handleAirtimePayment}
        orderItemDetails={orderDetailLists}
        orderDetailLabel={`₦${textFormatter(String(totalAmount), true, true)}`}
        orderDetailTitle="Payment"
        pin={pin}
        setPin={setPin}
        label={`₦${textFormatter(billAmount, true, true)}`}
      />
    </ScrollView>
  );
};

export default Index;
