import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  Text
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import CustomTextInput from "./CustomTextInput";
import ContactList from "./ContactList";
import { X } from "lucide-react-native";

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
    if(phone.length === MAX_PHONE_LENGTH + 2){
      Keyboard.dismiss()
    }
  };  

  const handleSelectBeneficiary = (val: string | null) => {
    setValue(val);
  };

  return (
    <View className="mt-0.5 z-90">
      <CustomTextInput
        height={70}
        multiline
        borderColor="transparent"
        customLeftIcon={
          <Text className="font-extrabold text-[#aaa] text-[20px]">
            +234
          </Text>
        }
        style={{
          fontSize: 20,
          fontWeight: "800",
          paddingVertical: 10,
        }}
        placeholder="0xx xxxx xxxx"
        value={formatPhoneNumber(value || "")}
        onChangeText={handlePhoneInput}
        onTouchStart={() => setOpen(true)}
        maxLength={MAX_PHONE_LENGTH + 2}
        label={""}
        inputType="phone-pad"
        setValue={handlePhoneInput}
        customRightIcon={
          <ContactList onSelect={(number) => setValue(number)} />
        }
      />
         <View
        style={{
          borderBottomColor: "#fff",
          borderWidth: 0.5,
          bottom: 15,
          marginHorizontal: 20,
        }}
      />
    {beneficiaries.length > 0 &&  <DropDownPicker
        open={open && beneficiaries.length > 0}
        value={value}
        CloseIconComponent={() => <X />}
        items={beneficiaryData.map((b) => ({
          label: b.label,
          value: b.value,
        }))}
        setOpen={setOpen}
        closeOnBackPressed
        setValue={setValue}
        showArrowIcon={true}
        textStyle={{
          color: "red",
          fontSize: 14,
          paddingHorizontal: 10,
        }}
        onChangeValue={handleSelectBeneficiary}
        style={[
          styles.dropdown,
          {
            zIndex: 100000,
          },
        ]}
        placeholder="Select number from beneficiary list"
        dropDownContainerStyle={{
          borderWidth: 0,
          top: 40,
          zIndex: 100000,
        }}
        labelStyle={{
          fontSize: 14,
        }}
        placeholderStyle={styles.placeholderStyle}
        setItems={setBeneficiariesData}
        maxHeight={200}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
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
  dropdown: {
    height: 20,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 8,
    bottom: 10,
    color: "blue",
  },
  placeholderStyle: {
    fontSize: 15,
    fontWeight: '700',
    color: "#ff6454"
  },
});

export default BeneficiaryInput;
