<<<<<<< HEAD
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

export default function OrdemServico() {
  const [modalOS, setModalOS] = useState(false);
  const [modalEquipe, setModalEquipe] = useState(false);
  const [modalRodovia, setModalRodovia] = useState(false);
  const [ordensServico, setOrdensServico] = useState([]);
  const [equipe, setEquipe] = useState("");
  const [rodovia, setRodovia] = useState("");
=======
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert,
} from "react-native";
import { useState } from "react";
import { TextInput } from "react-native";

export default function OrdemServico() {
  const [modalVisible, setModalVisible] = useState(false);
  const [equipe, setEquipe] = useState("");
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
  const [estadoGrama, setEstadoGrama] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [data, setData] = useState("");

<<<<<<< HEAD
  function limparFormulario() {
    setEquipe("");
    setRodovia("");
    setEstadoGrama("");
    setKmInicial("");
    setKmFinal("");
    setData("");
  }

  function fecharModalOS() {
    setModalOS(false);
    setModalEquipe(false);
    setModalRodovia(false);
    limparFormulario();
  }

  function enviarOrdemServico() {
    if (!equipe || !rodovia || !kmInicial || !kmFinal || !data || !estadoGrama) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos da ordem de serviço.");
      return;
    }

    const novaOrdem = {
      id: Date.now(),
      equipe,
      kmInicial,
      kmFinal,
      rodovia,
      data,
      estadoGrama,
    };

    setOrdensServico((ordensAtuais) => [novaOrdem, ...ordensAtuais]);
    fecharModalOS();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/motiva-logo-branca.png")}
          style={styles.logo}
        />
      </View>

=======
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
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
<<<<<<< HEAD
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Ordens de Serviço</Text>
              <Text style={styles.subtitle}>
                {ordensServico.length === 0
                  ? "Nenhuma ordem criada ainda"
                  : `${ordensServico.length} ordem(ns) criada(s)`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => setModalOS(true)}
            >
              <Text style={styles.newButtonText}>+ Nova</Text>
            </TouchableOpacity>
          </View>

          {ordensServico.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma ordem de serviço</Text>
              <Text style={styles.emptyText}>
                Crie uma ordem para acompanhar as equipes e os trechos atendidos.
              </Text>
            </View>
          ) : (
            ordensServico.map((ordem, index) => (
              <View style={styles.orderCard} key={ordem.id}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderTitle}>Ordem #{ordensServico.length - index}</Text>
                  <Text style={styles.orderStatus}>Criada</Text>
                </View>
                <Text style={styles.orderInfo}>Equipe: {ordem.equipe}</Text>
                <Text style={styles.orderInfo}>Rodovia: {ordem.rodovia}</Text>
                <Text style={styles.orderInfo}>
                  Trecho: KM {ordem.kmInicial} até KM {ordem.kmFinal}
                </Text>
                <Text style={styles.orderInfo}>Data: {ordem.data}</Text>
                <Text style={styles.orderInfo}>Estado da grama: {ordem.estadoGrama}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalOS}
        transparent
        animationType="slide"
        onRequestClose={fecharModalOS}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova ordem de serviço</Text>
              <TouchableOpacity onPress={fecharModalOS}>
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Equipe</Text>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setModalEquipe(true)}
              >
                <Text style={styles.selectText}>
                  {equipe || "Selecione uma equipe"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Rodovia</Text>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setModalRodovia(true)}
              >
                <Text style={styles.selectText}>
                  {rodovia || "Selecione uma rodovia"}
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
                {["Normal", "Atenção", "Crítico"].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.grassButton,
                      estadoGrama === estado && styles.grassButtonSelected,
                    ]}
                    onPress={() => setEstadoGrama(estado)}
                  >
                    <Text
                      style={[
                        styles.grassButtonText,
                        estadoGrama === estado && styles.grassButtonTextSelected,
                      ]}
                    >
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={enviarOrdemServico}
              >
                <Text style={styles.submitButtonText}>Criar ordem de serviço</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalEquipe}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEquipe(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.teamModalContent}>
            <Text style={styles.modalTitle}>Escolha a equipe</Text>
            {["Equipe 1", "Equipe 2", "Equipe 3"].map((nomeEquipe) => (
              <TouchableOpacity
                key={nomeEquipe}
                style={styles.teamOption}
                onPress={() => {
                  setEquipe(nomeEquipe);
                  setModalEquipe(false);
                }}
              >
                <Text style={styles.teamOptionText}>{nomeEquipe}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalEquipe(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalRodovia}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRodovia(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.teamModalContent}>
            <Text style={styles.modalTitle}>Escolha a rodovia</Text>
            {["BR-101", "BR-116", "BR-381", "SP-348"].map((nomeRodovia) => (
              <TouchableOpacity
                key={nomeRodovia}
                style={styles.teamOption}
                onPress={() => {
                  setRodovia(nomeRodovia);
                  setModalRodovia(false);
                }}
              >
                <Text style={styles.teamOptionText}>{nomeRodovia}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalRodovia(false)}
=======
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
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
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
<<<<<<< HEAD
  logo: { height: 100, width: 200, resizeMode: "contain" },
  content: { padding: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 6 },
  newButton: {
    backgroundColor: "#5E22F3",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  newButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#222" },
  emptyText: { color: "#666", textAlign: "center", marginTop: 8, lineHeight: 21 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#5E22F3",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderTitle: { fontSize: 17, fontWeight: "bold", color: "#222" },
  orderStatus: { color: "#15803D", fontWeight: "600" },
  orderInfo: { color: "#555", marginTop: 5, fontSize: 15 },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  closeText: { color: "#5E22F3", fontWeight: "600" },
  label: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 8 },
=======
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
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
  select: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectText: { fontSize: 16, color: "#777" },
<<<<<<< HEAD
  kmContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
=======
  kmContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
  kmInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
<<<<<<< HEAD
  kmText: { marginHorizontal: 10, fontSize: 15, color: "#555" },
=======
  kmText: {
    marginHorizontal: 10,
    fontSize: 15,
    color: "#555",
  },
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
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
<<<<<<< HEAD
  grassButtonText: { fontSize: 15, fontWeight: "600" },
  grassButtonSelected: { backgroundColor: "#5E22F3", borderColor: "#5E22F3" },
  grassButtonTextSelected: { color: "#fff" },
=======
  grassButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
  submitButton: {
    backgroundColor: "#5E22F3",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
<<<<<<< HEAD
    marginBottom: 8,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  teamModalContent: {
    width: "85%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: "auto",
    marginTop: "auto",
  },
  teamOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  teamOptionText: { fontSize: 16 },
  cancelButton: { marginTop: 15, padding: 12, alignItems: "center" },
  cancelButtonText: { color: "#5E22F3", fontSize: 16, fontWeight: "bold" },
=======
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
>>>>>>> ea0358c13f88c25e5fbe7f44d745e37281cc3efe
});
