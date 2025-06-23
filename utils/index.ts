import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { numericFormatter } from "react-number-format";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const storeTokens = async (token: string) => {
  try {
    await SecureStore.setItemAsync("authToken", token);
  } catch (error: any) {
    Alert.alert("An error occured", error?.message);
  }
};

export const getToken = async () => {
  try {
    const token: string | null = await SecureStore.getItemAsync("authToken");
    return JSON.parse(String(token));
  } catch (error: any) {
    Alert.alert("An error occured", error?.message);
  }
};
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } catch (error: any) {
    Alert.alert("An error occured", error?.message);
  }
};

export const textFormatter = (
  text: string | undefined | null,
  withThousand?: boolean,
  withFixedDemcimal?: boolean
) => {
  const safeText = String(text || "");

  if (withThousand) {
    return numericFormatter(safeText.replace(/[^.\d]/g, ""), {
      decimalSeparator: ".",
      decimalScale: 2,
      thousandSeparator: ",",
      fixedDecimalScale: withFixedDemcimal,
      allowNegative: false,
      valueIsNumericString: false,
      thousandsGroupStyle: "thousand",
    });
  }

  return numericFormatter(safeText.replace(/[^.\d]/g, ""), {
    decimalSeparator: ".",
    decimalScale: 2,
    thousandSeparator: false,
    allowNegative: false,
    valueIsNumericString: false,
  });
};

export const getStorageData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e: any) {
    Alert.alert("an error occured", e || e?.message);
    throw new Error(e || e?.message);
  }
};

export const storeData = async (key: string, value: Record<string, unknown> | Record<string, unknown>[]) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e: any) {
    Alert.alert("an error occured", e || e?.message);
    throw new Error(e || e?.message);
  }
};

export const removeStoredData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e: any) {
    Alert.alert("an error occured", e || e?.message);
    throw new Error(e || e?.message);
  }
};

export const formatFileSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0Byte";
  const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`);
  return Math.round(bytes / Math.pow(1024, i)) + sizes[i];
};

export const currencyConverter = async (
  nairaEquivalent: number,
  currency: string
) =>
  await converter.convertOnDate(
    nairaEquivalent,
    "ngn",
    currency.toLowerCase(),
    new Date()
  );

export const getTimeRepresentation = (timestamp: number) => {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - timestamp;

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return months + "m ago";
  } else if (weeks > 0) {
    return weeks + "w ago";
  } else if (days > 0) {
    return days + "d ago";
  } else if (hours > 0) {
    return hours + "h ago";
  } else if (minutes > 0) {
    return minutes + "mins ago";
  } else {
    return seconds + "secs";
  }
};

export const formattedTimestamp = (timeStamp: number) => {
  const DateTime = new Date(+timeStamp);

  const day = DateTime.getDate();
  const month = DateTime.toLocaleString("default", { month: "long" });
  const year = DateTime.getFullYear();
  const hours = DateTime.getHours();
  const minutes = DateTime.getMinutes();

  const formattedHours = hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? "pm" : "am";

  const formattedDate = `${day} ${month.slice(
    0,
    3
  )} ${year}, ${formattedHours}:${minutes.toString().padStart(2, "0")}${ampm}`;

  return formattedDate;
};

export const currencySymbol = (currencyCode: string) => {
  let currencyIcon;
  switch (currencyCode) {
    case "CAD":
      currencyIcon = "$";
      break;
    case "USD":
      currencyIcon = "$";
      break;
    case "GBP":
      currencyIcon = "£";
      break;
    case "NGN":
      currencyIcon = "₦";
      break;
    default:
      currencyIcon = "1";
  }
  return currencyIcon;
};

export const currencyValueToNumber = (value: string) =>
  Number(parseFloat(value).toFixed(3)) || 0;

export const currencyValueToString = (value: number) => String(value || 0);

export const randomNumber = () => Math.floor(Math.random() * 100) + 1;

export const getEpochTimestamp = (dateString: Date, timeString: Date) => {
  if (dateString && timeString) {
    const date = `${dateString?.getFullYear()}-${
      dateString?.getMonth() + 1
    }-${dateString.getDate()}`;
    const time = `${
      timeString.getHours() - 1
    }:${timeString.getMinutes()}:${timeString.getSeconds()}`;
    const dateTimeString = `${date}T${time}.000Z`;
    const dateTimeObject = new Date(dateTimeString);
    return dateTimeObject;
  } else {
    return null;
  }
};

export const _handlePressButtonAsync = async (url: string) => {
  await WebBrowser.openBrowserAsync(url);
};


export function getNetworkProvider(phoneNumber: string, category: string) {
  const networkPrefixes = {
      mtn: ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
      airtel: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0907', '0904'],
      glo: ['0705', '0805', '0807', '0811', '0815', '0905'],
      '9MOBILE': ['0809', '0817', '0818', '0909', '0908']
  };

  const prefix = phoneNumber && phoneNumber.slice(0, 4); 

  if (networkPrefixes.mtn.includes(prefix)) {
      return  {name: "MTN", productCode: category==="AIRTIME"? "mtn": "mtn-data"};
  } else if (networkPrefixes.airtel.includes(prefix)) {
      return  {name: "AIRTEL", productCode: category==="AIRTIME"? "airtel" :"airtel-data"};
  } else if (networkPrefixes.glo.includes(prefix)) {
      return  {name: "GLO", productCode:category==="AIRTIME"? "glo" : "glo-data"};
  } else if (networkPrefixes['9MOBILE'].includes(prefix)) {
      return  {name: "9MOBILE", productCode: category==="AIRTIME" ? "etisalat":"etisalat-data"};
  } else {
      return {name: "MTN", productCode: category==="AIRTIME"? "mtn": "mtn-data"};
  }
}

// utils/transactionFeeCalculator.ts

/**
 * Utility to calculate transaction fee.
 * 
 * @param billAmount - The amount for which the transaction is being made.
 * @param nairaToDollarRate - The exchange rate for converting Naira to USD.
 * @param percentageFee - The percentage of the amount charged as a transaction fee.
 * 
 * @returns { number } - The calculated transaction fee (capped at 100).
 */
export const calculateTransactionFee = (
  billAmount: number,
  nairaToDollarRate: number,
  percentageFee: number
): number => {
  const usdValue = billAmount / nairaToDollarRate;

  const fee = usdValue * percentageFee;

  const cappedValue = 100/nairaToDollarRate

  const cappedFee = Math.min(fee, cappedValue);  

  return cappedFee;
};

