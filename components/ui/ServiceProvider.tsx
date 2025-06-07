import useServiceProviderOptions from "@/hooks/userServiceProviderOption";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  Text
} from "react-native";

interface ServiceProviderProps {
  activeIcon: any;
  setActiveIcon: React.Dispatch<React.SetStateAction<string>>;
  serviceCategory: string;
  setPreferredPackage: any;
}
import { useTheme } from '@/hooks/useTheme';

export default function ServiceProvider({
  activeIcon,
  setActiveIcon,
  setPreferredPackage,
  serviceCategory,
}: ServiceProviderProps) {
  const handleIconClick = (data: any) => {
    setActiveIcon(data);
  };
  const {colors} = useTheme()

  const { serviceProviderOptions, isLoading, errorFetching  } = useServiceProviderOptions(
    serviceCategory.toUpperCase()
  );

  return (
    <View style={styles.serviceProvider}>
      
      <Text style={[styles.actionText, {color: colors.text}]}>Select service provider</Text>
      {isLoading ? (
        <Text style={{fontWeight: "bold", color: colors.textSecondary}}>Loading service providers...</Text>
      ) : (
        <SafeAreaView style={styles.serviceProviderIconContainer}>
          {serviceProviderOptions &&
            serviceProviderOptions.map((provider, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setPreferredPackage({});
                    handleIconClick(provider);
                  }}
                  style={{display:"flex", alignItems:"center", gap: 5}}
                >
                  <View
                    style={{
                      borderWidth: 0.5,
                      borderColor:
                        activeIcon?.name === provider.name
                          ? "#ff645433"
                          : "#d3d3d3",
                      borderRadius: 6,
                      width: 65,
                      height: 43,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        activeIcon?.name === provider.name
                          ? "#ff645433"
                          : "#fff",
                    }}
                  >
                    <Image
                      testID={`image${index}`}
                      style={{ width: "80%", height: "80%" }}
                      source={{ uri: provider.imageUrl }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={{fontWeight: "bold", color: colors.textSecondary}}>
                    {provider.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  serviceProvider: {
    marginTop: 30,
    marginHorizontal: 20,
    overflow: "scroll",
  },
  serviceProviderIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 15,
    color: "#777",
  },
});
