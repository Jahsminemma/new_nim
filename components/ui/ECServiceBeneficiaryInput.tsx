import { useTheme } from "@/hooks/useTheme";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import CustomTextInput from "./CustomTextInput";
import { X } from "lucide-react-native";

type Beneficiary = {
  label: string;
  value: string;
};

interface IBeneficiaryInput extends TextInputProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  value: string;
  setValue: Dispatch<SetStateAction<string | null>>;
  label: string;
  onRenew: () => void;
  onSelect: () => void;
  beneficiaries: Beneficiary[];
  showInputBtn: boolean;
}

const MAX_PHONE_LENGTH = 11;

const ECServiceBeneficiaryInput = ({
  open,
  setOpen,
  value,
  onSelectionChange,
  setValue,
  beneficiaries,
  label,
  onSelect,
  onRenew,
  showInputBtn,
  ...props
}: IBeneficiaryInput) => {
  const { colors } = useTheme();

  const [beneficiaryData, setBeneficiariesData] = useState(beneficiaries);

  useEffect(() => {
    setBeneficiariesData(beneficiaries);
  }, [beneficiaries]);

  const handleSelectBeneficiary = (val: string | null) => {
    onSelect();
    setValue(val);
  };

  const handleNumberInput = (val: string) => {
    let number = val.replace(/\D/g, "");
  
    setValue(number);
  
    const filtered = beneficiaries.filter((b) => b.value.startsWith(number.replace(/\s/g, "")));
    setBeneficiariesData(filtered);
  
    if (filtered.length === 0) {
      setOpen(false);
    } else {
      setOpen(true);
    }

    if(filtered.some((item) => item.value === number)){
      setOpen(false)
     }
  };

  return (
    <View style={[styles.container, { zIndex: 90 }]}>
      <CustomTextInput
        height={70}
        multiline
        borderColor="transparent"
        bgColor={colors.card}
        color={colors.text}
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.card 
          }
        ]}
        customRightIcon={
          <View>
            {label !== "meter" && value.length > 5 && showInputBtn && (
              <TouchableOpacity 
                style={[styles.proceedButton, { backgroundColor: colors.primary }]} 
                onPress={() => onRenew()}
              >
                <Text style={styles.proceedButtonText}>Proceed</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        placeholder={`Enter your ${label} number`}
        value={String(value)}
        onChangeText={handleNumberInput}
        onTouchStart={() => setOpen(true)}
        maxLength={MAX_PHONE_LENGTH + 2}
        label={""}
        inputType="phone-pad"
        setValue={setValue}
        {...props}
      />
      <View
        style={[
          styles.divider,
          {
            borderBottomColor: colors.border,
            borderWidth: 0.5,
            bottom: 15,
            marginHorizontal: 20,
          }
        ]}
      />
      {beneficiaries.length > 0 && (
        <DropDownPicker
          open={open && beneficiaries.length > 0}
          value={value}
          CloseIconComponent={() => <X color={colors.text} size={16} />}
          items={beneficiaryData.map((b) => ({
            label: b.label,
            value: b.value,
          }))}
          setOpen={setOpen}
          closeOnBackPressed
          setValue={setValue}
          showArrowIcon={true}
          textStyle={[
            styles.dropdownText,
            {
              color: colors.text,
              fontSize: 14,
              paddingHorizontal: 10,
            }
          ]}
          onChangeValue={handleSelectBeneficiary}
          style={[
            styles.dropdown,
            {
              zIndex: 100000999,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          placeholder={`Select ${label} number from beneficiary list`}
          dropDownContainerStyle={[
            styles.dropdownContainer,
            {
              borderWidth: 0,
              top: 40,
              zIndex: 100000,
              backgroundColor: colors.card,
              borderColor: colors.border,
              elevation: 10000,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }
          ]}
          listItemLabelStyle={[
            styles.listItemLabel,
            { color: colors.text }
          ]}
          labelStyle={[
            styles.labelStyle,
            {
              fontSize: 14,
              color: colors.text,
            }
          ]}
          placeholderStyle={[
            styles.placeholderStyle,
            {
              fontSize: 12,
              fontWeight: "700",
              color: colors.textSecondary,
            }
          ]}
          setItems={setBeneficiariesData}
          maxHeight={200}
          zIndex={100000}
          zIndexInverse={1000}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
    zIndex: 999999
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 0,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 25,
    fontWeight: "700",
  },
  proceedButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  divider: {},
  dropdown: {
    height: 20,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 8,
    bottom: 10,
    color: "blue",
  },
  dropdownContainer: {
    zIndex:999999
  },
  dropdownText: {},
  listItemLabel: {
    fontFamily: 'Inter-Regular',
  },
  labelStyle: {
    fontFamily: 'Inter-Medium',
  },
  placeholderStyle: {
    fontFamily: 'Inter-Medium',
  },
});

export default ECServiceBeneficiaryInput;