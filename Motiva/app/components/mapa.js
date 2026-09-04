import { StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
 
export default function Map() {
  return (
<View style={styles.container}>
<MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
>
<Marker
          coordinate={{
            latitude: -23.5505,
            longitude: -46.6333,
          }}
          title="São Paulo"
          description="Meu primeiro marcador"
        />
</MapView>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  map: {
    width: "100%",
    height: "100%",
  },
});