import * as SecureStore from "expo-secure-store";
import { Alert, Platform, Share } from "react-native";
import { numericFormatter } from "react-number-format";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useError, ErrorType } from "../hooks";
import * as WebBrowser from "expo-web-browser";
import * as converter from "currency-exchanger-js";
import Toast from "react-native-toast-message";

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
  text: string,
  withThousand?: boolean,
  withFixedDemcimal?: boolean
) => {
  if (!text) return "";

  if (withThousand) {
    return numericFormatter(text.replace(/[^.\d]/g, ""), {
      decimalSeparator: ".",
      decimalScale: 2,
      thousandSeparator: ",",
      fixedDecimalScale: withFixedDemcimal,
      allowNegative: false,
      valueIsNumericString: false,
      thousandsGroupStyle: "thousand",
    });
  }

  return numericFormatter(text.replace(/[^.\d]/g, ""), {
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

export const storeData = async (key: string, value: any) => {
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

const nimboonCacheDir = FileSystem.cacheDirectory + "nimboon/";
const nimboonDocDir = FileSystem.documentDirectory + "nimboon/";

export const ensureDirExists = async (dir: any) => {
  let dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    dirInfo = await FileSystem.getInfoAsync(dir);
  }
  return dirInfo;
};

export const isSharingAvailable = async () => await Sharing.isAvailableAsync();

export const shareContent = async (
  data: any,
  receiptId: string,
  fileType: string
) => {
  const dirDetails = await ensureDirExists(nimboonCacheDir);
  if (dirDetails.exists) {
    const downloadPath = `${dirDetails.uri}-${receiptId}.${fileType}`;
    try {
      await FileSystem.writeAsStringAsync(downloadPath, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const canShare = await isSharingAvailable();
      if (canShare) {
        await Sharing.shareAsync(downloadPath);
      } else {
        useError(ErrorType.ERROR, "Sharing is not available.");
      }
    } catch (e: any) {
      useError(ErrorType.ERROR, e);
    }
  } else {
    useError(ErrorType.ERROR, "Directory doesn't exists.");
  }
};

export const downloadImage = async (pdfData: any, receiptId: string) => {
  if (Platform.OS === "ios") return shareReceipt(pdfData, receiptId);

  const dirDetails = await ensureDirExists(nimboonDocDir);
  if (dirDetails.exists) {
    try {
      const billantedUri =
        FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("billanted");
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          billantedUri
        );
      if (permissions.granted) {
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          `Billanted-Receipt-${receiptId}`,
          "application/pdf"
        );
        if (fileUri) {
          const file = await FileSystem.writeAsStringAsync(fileUri, pdfData, {
            encoding: FileSystem.EncodingType.Base64,
          });
          Alert.alert(
            "Download Successful",
            `Billanted-Receipt-${receiptId}.pdf download successful.`
          );
        } else {
          useError(ErrorType.ERROR, "Unable to create file.");
        }
      } else {
        useError(
          ErrorType.ERROR,
          "Unable grant file system storage permission."
        );
      }
    } catch (e: any) {
      useError(ErrorType.ERROR, e);
    }
  } else {
    useError(ErrorType.ERROR, "Directory doesn't exists.");
  }
};

export const getUserAlias = (user: any) => {
  if (!user) return null;
  
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return {
    userId: user?.userId,
    fullName: fullName || '',
    firstName: firstName,
    lastName: lastName,
    initials: `${firstName?.charAt(0)?.toUpperCase() || ''}${lastName?.charAt(0)?.toUpperCase() || ''}`,
    phoneNumber: user?.phoneNumber,
    emailAddress: user?.emailAddress,
    country: user?.country,
    userName: user?.userName || '',
    photoUrl: user?.photo_url,
  };
};

export const firstLetterUpperCase = (value: string) => {
  const uppercaseVlue =
    value.charAt(0).toUpperCase() + value.slice(1).toLocaleString();
  return uppercaseVlue;
};

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

export const calculateEndTime = (
  startDate: Date,
  numberOfQuestions: number
) => {
  const questionTimeInSeconds = 30;

  const totalTimeInSeconds = numberOfQuestions * questionTimeInSeconds;

  const totalTimeInMilliseconds = totalTimeInSeconds * 1000;

  const startTime = new Date(startDate).getTime();

  const endDate = new Date(startTime + totalTimeInMilliseconds);

  return endDate;
};

export const _handlePressButtonAsync = async (url: string) => {
  await WebBrowser.openBrowserAsync(url);
};

export const showAlert = ({
  action1,
  action2,
  title,
  desc,
  btnText1,
  btnText2
}: {
  action1: () => void;
  action2: () => void;
  title: string;
  desc: string;
  btnText1: string;
  btnText2: string
}) => {
  Alert.alert(
    title,
    desc,
    [
      {
        text: btnText1,
        onPress: action1,
        style: "cancel",
      },
      {
        text: btnText2,
        onPress: action2,
        style: "default",
      },
    ],
    { cancelable: false }
  );
};

export const shareLink = async ({link, title, successText}:{link: string, title: string, successText:string} ) => {
  const shareMessage = `${title}: ${link}`;
  try {
    const canShare = await isSharingAvailable();
    if (canShare) {
      const result = await Share.share({
        message: shareMessage,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          Toast.show({
            type: "success",
            text1: "Content Shared",
            text2: successText,
          });
        }
      }
    } else {
      useError(ErrorType.ERROR, "Sharing is not available.");
    }
  } catch (e: any) {
    useError(ErrorType.ERROR, e);
  }
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

