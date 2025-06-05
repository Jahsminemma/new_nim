import { View, Text, Alert, Pressable, ActivityIndicator, Modal, StyleSheet, Dimensions } from "react-native";
import React from "react";
import CustomDateAndTime from "./CustomDateAndTime";
import { X } from 'lucide-react-native';
import { useTheme } from "@/hooks/useTheme";

interface DateComponentProps {
  onClose: () => void;
  startDate: Date;
  setStartDate: (value: Date) => void;
  endDate: Date;
  setEndDate: (value: Date) => void;
  endTime: Date;
  setEndTime: (value: Date) => void;
  setStartTime: (value: Date) => void;
  startTime: Date;
  onSubmit: () => void;
  open: boolean;
  loading: boolean;
}

const { width, height } = Dimensions.get('window');

const DateComponent = ({
  open,
  onClose,
  setEndDate,
  setStartDate,
  endDate,
  startDate,
  endTime,
  setEndTime,
  setStartTime,
  startTime,
  onSubmit,
  loading,
}: DateComponentProps) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Set Date and Time
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Challenge Start time
            </Text>
            <View style={styles.dateTimeContainer}>
              <CustomDateAndTime
                type={"date"}
                setValue={(value) => {
                  if (value.getTime() < new Date().getTime()) {
                    Alert.alert("Date Error", "You cannot choose passed date");
                    setStartDate(new Date());
                  } else {
                    setStartDate(value);
                  }
                }}
                value={startDate}
              />
              <CustomDateAndTime
                type={"time"}
                setValue={(value) => setStartTime(value)}
                value={startTime}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Challenge End time
            </Text>
            <View style={styles.dateTimeContainer}>
              <CustomDateAndTime
                type={"date"}
                setValue={(value) => {
                  if (value.getTime() < startDate.getTime()) {
                    Alert.alert(
                      "Date Error",
                      "You must choose date that is higher than the start date"
                    );
                    setEndDate(startDate);
                  } else {
                    setEndDate(value);
                  }
                }}
                value={endDate}
              />
              <CustomDateAndTime
                type={"time"}
                setValue={(value) => setEndTime(value)}
                value={endTime}
              />
            </View>
          </View>

          <Pressable
            onPress={onSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 500,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DateComponent;
