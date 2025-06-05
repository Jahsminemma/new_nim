import React from "react";
import {
  KeyboardType,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text
} from "react-native";

interface ICustomTextInput extends TextInputProps {
  label: string;
  customRightIcon?: React.ReactNode;
  customLeftIcon?: React.ReactNode;
  inputType: KeyboardType;
  prefixText?: string;
  height?: number;
  multiline?: boolean;
  setValue: (value: string) => void;
  borderColor?: string;
  bgColor?: string;
  richText?: boolean;
  phoneInput?: boolean;
  setCountryInfo?: (value: any) => void;
  multiSelectComponent?: React.ReactNode;
  color?: string;
  maxLength?: number
}

const CustomTextInput = ({
  multiSelectComponent,
  richText,
  height,
  phoneInput,
  label,
  customRightIcon,
  customLeftIcon,
  inputType,
  prefixText,
  multiline,
  setValue,
  bgColor,
  borderColor,
  placeholder,
  setCountryInfo,
  value,
  color,
  maxLength,
  ...props
}: ICustomTextInput) => {

  return (
    <SafeAreaView className="overflow-hidden">
      <Text style={styles.label}>{label}</Text>
        <View
          style={{
            ...styles.container,
            borderColor: borderColor || "#B3B4B4",
            height: multiline ? height : 50,
            backgroundColor: bgColor && bgColor,
            overflow: "hidden"
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            {customLeftIcon && (
              <View className="mr-4 bg-transparent">{customLeftIcon}</View>
            )}
            {prefixText && (
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 15,
                  paddingRight: 2,
                  opacity: 0.9,
                }}
              >
                {prefixText}
              </Text>
            )}
            <View
              style={{ backgroundColor: bgColor && bgColor }}
              className="w-full"
            >
              <TextInput
                style={[
                  styles.textInput,
                  {
                    height: multiline ? 130 : undefined,
                  },
                ]}
                defaultValue={value}
                keyboardType={inputType}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={placeholder || label}
                textAlignVertical={multiline ? "top" : "center"}
                multiline={multiline}
                placeholderTextColor={bgColor ? color ? color : "#cce" : "#777"}
                maxLength={maxLength} 
                onChangeText={(text: string) => setValue(text)}
                {...props}
              />
              {multiSelectComponent && (
                <View className="border w-[100%] mt-2 border-gray-300 border-0.5" />
              )}
              {multiSelectComponent}
            </View>
          </View>
          {customRightIcon && <>{customRightIcon}</>}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 15,
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },
  textInput: {
    opacity: 0.9,
    fontWeight: "400",
    fontSize: 15,
    marginRight: 8,
    fontFamily: "MulishRegular",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  editor: {
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rich: {
    minHeight: 80,
    flex: 1,
  },
  richBar: {
    height: 50,
    marginBottom: 40,
  },
});

export default CustomTextInput;
