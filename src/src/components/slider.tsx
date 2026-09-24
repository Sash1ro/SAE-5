import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '@/stores/stylesStore';

type Props = {
  value: number;
  onValueChange?: (val: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
};

export default function CustomSlider({ 
  value, 
  onValueChange, 
  label, 
  min = 0, 
  max = 1, 
  step 
}: Props) {
  return (
    <View style={styles.container}>
      {(label || value !== undefined) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          <Text style={styles.valueText}>{value.toFixed(2)}</Text>
        </View>
      )}
      
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.main}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.main}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.altText,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.placeHolder,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});