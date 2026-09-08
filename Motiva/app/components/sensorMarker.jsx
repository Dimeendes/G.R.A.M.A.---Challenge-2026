import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
 
export default function SensorMarker({ sensor }) {
  return (
<Marker
      coordinate={{
        latitude: sensor.latitude,
        longitude: sensor.longitude,
      }}
      title={sensor.name}
      description={`Altura da vegetação: ${sensor.grassHeight} cm`}
>
<View style={styles.marker}>
<Text style={styles.text}>🌱</Text>
</View>
</Marker>
  );
}
 
const styles = StyleSheet.create({
  marker: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "green",
  },
 
  text: {
    fontSize: 24,
  },
});