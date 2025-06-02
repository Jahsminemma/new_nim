import { useState, useMemo } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { AppDispatch } from "../redux/store";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slice/authSlice";
import {
  useAddPushNotificationTokenMutation,
  useEnablePushNotificationMutation,
} from "../redux/slice/userApiSlice";
import useError, { ErrorType } from "./useError";

const usePushNotification = () => {
  const [addPushNotificationToken] = useAddPushNotificationTokenMutation();
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [enablePushNotification] = useEnablePushNotificationMutation();
  const dispatch = useDispatch<AppDispatch>();

  enum PushNotificationStatus {
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
  }

  const registerForPushNotificationsAsync = useMemo(() => {
    const register = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== "granted") {
            useError(
              ErrorType.ERROR,
              "You must grant permission to receive push notifications in the device's settings."
            );
          }
        }

        const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
          projectId: Constants?.expoConfig?.extra?.eas?.projectId,
          applicationId: "com.jesokes.nimboon"
        });
        if (!expoToken) {
          useError(
            ErrorType.ERROR,
            "Failed to get token for push notification!"
          );
        }

        return expoToken;
      } catch (error) {
        throw (error)
      }
    };

    return register;
  }, []);

  const handlePushNotification = async (
    value: boolean,
    isRevalidating?: boolean
  ) => {
    setIsPushLoading(true);
    let status: PushNotificationStatus = PushNotificationStatus.FAILED;
    try {
      if (value) {
        const expoToken = await registerForPushNotificationsAsync();        
        const addPushNotificationTokenRes = await addPushNotificationToken(
          expoToken
        ).unwrap();                        
        if (
          addPushNotificationTokenRes?.message !==
          "successfully added the device token"
        ) {
          if (!isRevalidating)
            useError(ErrorType.ERROR, "Error occurred while uploading token.");
        }
      }

      const enablePushNotificationRes = await enablePushNotification(value).unwrap();      
      
      if (
        enablePushNotificationRes?.status === "success"
      ) {                        
        dispatch(setCredentials({ enablePush: value}));
        status = PushNotificationStatus.SUCCESSFUL;
      }
    } catch (error: any) {
      if (!isRevalidating) useError(ErrorType.ERROR, String(error));
      status = PushNotificationStatus.FAILED;
    } finally {
      setIsPushLoading(false);
    }
    return { status };
  };

  const revalidatePushNotificationStatus = (value: boolean) => {
    handlePushNotification(value, true);
  };




  return {
    handlePushNotification,
    isPushLoading,
    revalidatePushNotificationStatus,
    PushNotificationStatus,
  };
};

export default usePushNotification;
