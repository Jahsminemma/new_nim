import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  View,
  Text
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  AndroidNativeProps,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useTheme } from "@/hooks/useTheme";
import { ArrowBigDown } from "lucide-react-native";

interface ICustomDateAndTime {
  type: "time" | "date";
  setValue: (value: Date) => void;
  value: Date;
}

const CustomDateAndTime = ({ type, value, setValue }: ICustomDateAndTime) => {
  const androidParams: AndroidNativeProps = {
    mode: type,
    value: value,
    onChange(event, date) {
      date && setValue(date);
    },
  };

  const date = `${
    value?.getMonth() + 1
  }/${value?.getDate()}/${value.getFullYear()}`;

  const {  activeTheme: colorScheme } = useTheme();


  return (
    <View>
      <Text style={styles.label}>
        {type === "date" ? "Date" : "Time"}
      </Text>

      {Platform.OS === "ios" ? (
        <TouchableOpacity
          style={{
            marginLeft: -10,
          }}
        >
          <DateTimePicker
           accessibilityLabel="datetime picker"
            themeVariant={colorScheme as 'light' | 'dark' ?? "light"}
            value={value}
            mode={type}
            display="compact"
            onChange={(event, date) => {
              date && setValue(date);
            }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            ...styles.container,
          }}
          onPress={() => {
            DateTimePickerAndroid.open(androidParams);
          }}
        >
          <Text>
            {type === "date" ? date : format(value, "hh:mm a")}
          </Text>
          <View>
            <ArrowBigDown size={18} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 0.5,
    borderRadius: 6,
    height: 45,
    width: 130,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "#B3B4B4",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },
});

export default CustomDateAndTime;
