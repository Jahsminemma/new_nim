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
  showInputBtn: boolean
}

const MAX_PHONE_LENGTH = 11;

const BeneficiaryInput = ({
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
  const { activeTheme:colorScheme } = useTheme();

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
    <View className="mt-0.5 z-90">
      <CustomTextInput
        height={70}
        multiline
        borderColor="transparent"
        style={{
          fontWeight: "700",
          fontSize: 25,
          paddingVertical: 10,
        }}
        customRightIcon={
          <View>
      {label !== "meter" && value.length > 5 && showInputBtn && <TouchableOpacity className="bg-[#ff6454] p-2 rounded-xl" onPress={() => onRenew()}>
            <Text>Proceed</Text>
          </TouchableOpacity>}
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
        style={{
          borderBottomColor: "#fff",
          borderWidth: 0.5,
          bottom: 15,
          marginHorizontal: 20,
        }}
      />
      {beneficiaries.length > 0 && (
        <DropDownPicker
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
            color: "#777",
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
          placeholder={`Select ${label} number from beneficiary list`}
          dropDownContainerStyle={{
            borderWidth: 0,
            top: 40,
            zIndex: 100000,
          }}
          listItemLabelStyle={{
          }}
          labelStyle={{
            fontSize: 14,
          }}
          placeholderStyle={styles.placeholderStyle}
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
    fontSize: 12,
    fontWeight: "700",
    color: "#777",
  },
});

export default BeneficiaryInput;
