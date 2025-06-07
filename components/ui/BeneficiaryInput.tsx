import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import CustomTextInput from "./CustomTextInput";
import ContactList from "./ContactList";
import { X } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type Beneficiary = {
  label: string;
  value: string;
};

interface IBeneficiaryInput {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  beneficiaries: Beneficiary[];
}

const MAX_PHONE_LENGTH = 11;

const BeneficiaryInput = ({
  open,
  setOpen,
  value,
  setValue,
  beneficiaries,
}: IBeneficiaryInput) => {
  const { colors } = useTheme();
  const [beneficiaryData, setBeneficiariesData] = useState(beneficiaries);

  useEffect(() => {
    setBeneficiariesData(beneficiaries);
  }, [beneficiaries]);

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  };

  const handlePhoneInput = (val: string) => {
    let phone = val.replace(/\D/g, "");
  
    if (phone.length <= 3) {
      phone = phone;
    } else if (phone.length <= 7) {
      phone = phone.replace(/(\d{3})(\d{1,4})/, "$1 $2");
    } else {
      phone = phone.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1 $2 $3");
    }
  
    setValue(phone.trim());
    const filtered = beneficiaries.filter((b) => b.value.startsWith(phone.replace(/\s/g, "")));
    setBeneficiariesData(filtered);
    
    if (filtered.length === 0 || phone.length === MAX_PHONE_LENGTH + 2) {
      setOpen(false);
    } else {
      setOpen(true);
    }
    if(phone.length === MAX_PHONE_LENGTH + 2) {
      Keyboard.dismiss();
    }
  };  

  const handleSelectBeneficiary = (val: string | null) => {
    setValue(val);
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        height={70}
        multiline
        borderColor="transparent"
        customLeftIcon={
          <Text style={[styles.countryCode, { color: colors.textSecondary }]}>
            +234
          </Text>
        }
        style={[styles.input, { color: colors.text }]}
        placeholder="0xx xxxx xxxx"
        value={formatPhoneNumber(value || "")}
        onChangeText={handlePhoneInput}
        onTouchStart={() => setOpen(true)}
        maxLength={MAX_PHONE_LENGTH + 2}
        label=""
        inputType="phone-pad"
        setValue={handlePhoneInput}
        customRightIcon={
          <ContactList onSelect={(number) => setValue(number)} />
        }
      />
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
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
          textStyle={[styles.dropdownText, { color: colors.text }]}
          onChangeValue={handleSelectBeneficiary}
          style={[styles.dropdown, { backgroundColor: colors.card }]}
          placeholder="Select number from beneficiary list"
          dropDownContainerStyle={[styles.dropdownContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          }]}
          labelStyle={[styles.dropdownLabel, { color: colors.text }]}
          placeholderStyle={[styles.placeholder, { color: colors.textSecondary }]}
          setItems={setBeneficiariesData}
          maxHeight={200}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
  },
  input: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    paddingVertical: 10,
  },
  countryCode: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: -15,
  },
  dropdown: {
    height: 20,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 8,
    bottom: 10,
    top: 0
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 12,
    top: 50,
    zIndex: 100000,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 10,
  },
  dropdownLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  placeholder: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

export default BeneficiaryInput;