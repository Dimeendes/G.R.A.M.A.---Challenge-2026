import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert,
} from "react-native";
import { useState } from "react";
import { TextInput } from "react-native";

export default function OrdemServico() {
  const [modalVisible, setModalVisible] = useState(false);
  const [equipe, setEquipe] = useState("");
  const [estadoGrama, setEstadoGrama] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [data, setData] = useState("");

  function enviarOrdemServico() {
    if (!equipe) {
      Alert.alert("Campo obrigatório", "Selecione uma equipe.");
      return;
    }
    if (!kmInicial) {
      Alert.alert("Campo obrigatório", "Informe o KM inicial.");
      return;
    }
    if (!kmFinal) {
      Alert.alert("Campo obrigatório", "Informe o KM final.");
      return;
    }
    if (!data) {
      Alert.alert("Campo obrigatório", "Informe a data.");
      return;
    }
    if (!estadoGrama) {
      Alert.alert("Campo obrigatório", "Selecione o estado da grama.");
      return;
    }
    const ordemServico = {
      equipe: equipe,
      kmInicial: kmInicial,
      kmFinal: kmFinal,
      data: data,
      estadoGrama: estadoGrama,
    };
    console.log(ordemServico);
    Alert.alert("Ordem de Serviço", "Ordem de serviço criada com sucesso!");
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image
            source={require("../assets/motiva-logo-branca.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Ordem de Serviço</Text>
          <Text style={styles.subtitle}>Crie uma nova ordem de serviço</Text>
          <Text style={styles.label}>Equipe</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectText}>
              {equipe || "Selecione uma equipe"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.label}>Quilometragem</Text>
          <View style={styles.kmContainer}>
            <TextInput
              style={styles.kmInput}
              placeholder="KM inicial"
              keyboardType="numeric"
              value={kmInicial}
              onChangeText={setKmInicial}
            />
            <Text style={styles.kmText}>até</Text>
            <TextInput
              style={styles.kmInput}
              placeholder="KM final"
              keyboardType="numeric"
              value={kmFinal}
              onChangeText={setKmFinal}
            />
          </View>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={data}
            onChangeText={setData}
          />
          <Text style={styles.label}>Estado da grama</Text>
          <View style={styles.grassContainer}>
            <TouchableOpacity
              style={[
                styles.grassButton,
                estadoGrama === "Normal" && styles.grassButtonSelected,
              ]}
              onPress={() => setEstadoGrama("Normal")}
            >
              <Text
                style={[
                  styles.grassButtonText,
                  estadoGrama === "Normal" && styles.grassButtonTextSelected,
                ]}
              >
                Normal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.grassButton,
                estadoGrama === "Atenção" && styles.grassButtonSelected,
              ]}
              onPress={() => setEstadoGrama("Atenção")}
            >
              <Text
                style={[
                  styles.grassButtonText,
                  estadoGrama === "Atenção" && styles.grassButtonTextSelected,
                ]}
              >
                Atenção
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.grassButton,
                estadoGrama === "Crítico" && styles.grassButtonSelected,
              ]}
              onPress={() => setEstadoGrama("Crítico")}
            >
              <Text
                style={[
                  styles.grassButtonText,
                  estadoGrama === "Crítico" && styles.grassButtonTextSelected,
                ]}
              >
                Crítico
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton}
            onPress={enviarOrdemServico}
          >
            <Text style={styles.submitButtonText}>Enviar Ordem de Serviço</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha a equipe</Text>
            <TouchableOpacity
              style={styles.teamOption}
              onPress={() => {
                setEquipe("Equipe 1");
                setModalVisible(false);
              }}
            >
              <Text style={styles.teamOptionText}>Equipe 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.teamOption}
              onPress={() => {
                setEquipe("Equipe 2");
                setModalVisible(false);
              }}
            >
              <Text style={styles.teamOptionText}>Equipe 2</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.teamOption}
              onPress={() => {
                setEquipe("Equipe 3");
                setModalVisible(false);
              }}
            >
              <Text style={styles.teamOptionText}>Equipe 3</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    backgroundColor: "#5E22F3",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 100,
    width: 200,
    resizeMode: "contain",
  },
  content: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  select: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectText: { fontSize: 16, color: "#777" },
  kmContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  kmInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  kmText: {
    marginHorizontal: 10,
    fontSize: 15,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  grassContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  grassButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  grassButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#5E22F3",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  teamOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  teamOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#5E22F3",
    fontSize: 16,
    fontWeight: "bold",
  },
  grassButtonSelected: {
    backgroundColor: "#5E22F3",
    borderColor: "#5E22F3",
  },
  grassButtonTextSelected: {
    color: "#fff",
  },
});
