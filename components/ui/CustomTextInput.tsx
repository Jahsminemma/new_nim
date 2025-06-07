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
import { useTheme } from "@/hooks/useTheme";

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
  height,
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
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View
          style={{
            ...styles.container,
            borderColor: borderColor || colors.border,
            height: multiline ? height : 50,
            backgroundColor: colors.card,
            overflow: "hidden"
          }}
        >
          <View style={styles.inputWrapper}>
            {customLeftIcon && (
              <View style={styles.leftIconContainer}>{customLeftIcon}</View>
            )}
            {prefixText && (
              <Text
                style={[styles.prefixText, { color: colors.textSecondary }]}
              >
                {prefixText}
              </Text>
            )}
            <View
              style={[styles.inputContainer, { backgroundColor: colors.card }]}
            >
              <TextInput
                style={[
                  styles.textInput,
                  {
                    height: multiline ? 130 : undefined,
                    width: '80%',
                    color
                  },
                ]}
                defaultValue={value}
                keyboardType={inputType}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={placeholder || label}
                placeholderTextColor={colors.textSecondary}
                textAlignVertical={multiline ? "top" : "center"}
                multiline={multiline}
                maxLength={maxLength} 
                onChangeText={(text: string) => setValue(text)}
                {...props}
              />
              {multiSelectComponent && (
                <View style={styles.multiSelectBorder} />
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
  safeArea: {
    overflow: 'hidden',
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 15,
    width: "100%",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  leftIconContainer: {
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefixText: {
    fontWeight: "400",
    fontSize: 15,
    paddingRight: 2,
    opacity: 0.9,
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
  multiSelectBorder: {
    borderWidth: 0.5,
    width: '100%',
    marginTop: 8,
    borderColor: '#D1D5DB',
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
