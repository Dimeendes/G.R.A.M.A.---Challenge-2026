import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { useSensors } from "./context/SensorsContext";
import { getGrassHeightStatus } from "./data/sensorsData";
import Constants from "expo-constants";
 
const { IPESP32 } = Constants.expoConfig?.extra || {};
 
export default function OrdemServico() {
  const router = useRouter();
  const { sensorId } = useLocalSearchParams();
  const { user, logout } = useAuth();
  const isFuncionario = user?.role === "funcionario";
  const [modalOS, setModalOS] = useState(false);
  const [modalEquipe, setModalEquipe] = useState(false);
  const [modalSensor, setModalSensor] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [modalGramaAlta, setModalGramaAlta] = useState(false);
  const [mensagemModalVerificacao, setMensagemModalVerificacao] = useState("");
  const [ordemParaExcluir, setOrdemParaExcluir] = useState(null);
  const [ordensServico, setOrdensServico] = useState([]);
  const [filtroOS, setFiltroOS] = useState("andamento");
  const [notificacao, setNotificacao] = useState("");
  const quantidadeInicial = useRef(null);
  const [equipe, setEquipe] = useState("");
  const [sensorSelecionado, setSensorSelecionado] = useState(null);
  const [mensagemValidacao, setMensagemValidacao] = useState("");
  const { sensors, atualizarSensor } = useSensors();
  const sensorParamProcessado = useRef(null);
 
  useEffect(() => {
    if (
      !sensorId ||
      !sensors.length ||
      sensorParamProcessado.current === sensorId
    ) {
      return;
    }
 
    const sensor = sensors.find((item) => String(item.id) === String(sensorId));
 
    if (sensor) {
      sensorParamProcessado.current = sensorId;
      setSensorSelecionado(sensor);
      setMensagemValidacao("");
      setModalOS(true);
    }
  }, [sensorId, sensors]);
  useEffect(() => {
    async function carregarOrdens() {
      try {
        const ordensSalvas = await AsyncStorage.getItem("ordensServico");
        const ordens = ordensSalvas ? JSON.parse(ordensSalvas) : [];
        if (
          quantidadeInicial.current !== null &&
          isFuncionario &&
          ordens.length > quantidadeInicial.current
        ) {
          const novasOrdens = ordens.length - quantidadeInicial.current;
          const mensagem = `${novasOrdens} nova${novasOrdens > 1 ? "s" : ""} ordem${novasOrdens > 1 ? "s" : ""} de serviço recebida${novasOrdens > 1 ? "s" : ""}.`;
          setNotificacao(mensagem);
          Alert.alert("Nova ordem de serviço", mensagem);
        }
        quantidadeInicial.current = ordens.length;
        setOrdensServico(ordens);
      } catch (error) {
        console.error("Erro ao carregar ordens de serviço", error);
      }
    }
    carregarOrdens();
    const intervalo = setInterval(carregarOrdens, 2000);
    return () => clearInterval(intervalo);
  }, [isFuncionario]);
  async function salvarOrdens(ordens) {
    setOrdensServico(ordens);
    await AsyncStorage.setItem("ordensServico", JSON.stringify(ordens));
  }
  function obterAlturaAtual(ordem) {
    const sensorAtual = sensors.find((sensor) => sensor.id === ordem.sensorId);
    return sensorAtual?.grassHeight ?? ordem.alturaGrama;
  }
 
  function converterData(data) {
    if (!data || data === "Não disponível") {
      return Number.POSITIVE_INFINITY;
    }
 
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia).getTime();
  }
 
  const ordensOrdenadas = [...ordensServico].sort((ordemA, ordemB) => {
    return converterData(ordemA.dataLimite) - converterData(ordemB.dataLimite);
  });
 
  const ordensExibidas = ordensOrdenadas.filter((ordem) =>
    filtroOS === "concluidas"
      ? ordem.status === "Concluída"
      : ordem.status !== "Concluída",
  );
 
  function limparFormulario() {
    setEquipe("");
    setSensorSelecionado(null);
    setMensagemValidacao("");
  }
 
  function deletarOrdemServico(id) {
    setOrdemParaExcluir(id);
    setModalExclusao(true);
  }

  function abrirSensorNoMapa(ordem) {
    router.push({
      pathname: "/map",
      params: { sensorId: String(ordem.sensorId) },
    });
  }
 
  function confirmarExclusao() {
    setOrdensServico((ordensAtuais) =>
      ordensAtuais.filter((ordem) => ordem.id !== ordemParaExcluir),
    );
    const ordensAtualizadas = ordensServico.filter(
      (ordem) => ordem.id !== ordemParaExcluir,
    );
    salvarOrdens(ordensAtualizadas);
    setOrdemParaExcluir(null);
    setModalExclusao(false);
  }
 
  async function concluirOrdemServico(id) {
  const ordem = ordensServico.find((item) => item.id === id);
 
  if (!ordem) {
    console.log("ERRO: ordem não encontrada.");
    return;
  }
 
  console.log("================================");
  console.log("INICIANDO VERIFICAÇÃO");
  console.log("ID da ordem:", id);
  console.log("Sensor ID:", ordem.sensorId);
  console.log("IPESP32:", IPESP32);
 
  const enderecoConfigurado = String(IPESP32 || "").replace(/\/$/, "");
 
  const enderecoApi = /^https?:\/\//i.test(enderecoConfigurado)
    ? enderecoConfigurado
    : `http://${enderecoConfigurado}`;
 
  const endpoint = /:\d+$/.test(enderecoApi)
    ? `${enderecoApi}/verificar`
    : `${enderecoApi}:5000/verificar`;
 
  console.log("Endpoint final:", endpoint);
  console.log("================================");
 
  try {
    console.log("ANTES DO FETCH");
console.log("Endpoint:", endpoint);
 
const resposta = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: Number(ordem.sensorId),
  }),
});
 
console.log("DEPOIS DO FETCH");
console.log("Status:", resposta.status);
 
const texto = await resposta.text();
console.log("Resposta:", texto);
 
    let resultado;
 
    try {
      resultado = JSON.parse(texto);
    } catch (erro) {
      console.log("Resposta não é JSON válido.");
      throw new Error(
        `A API retornou uma resposta inválida: ${texto}`
      );
    }
 
    console.log("Resultado JSON:", resultado);
 
    if (!resposta.ok) {
      throw new Error(
        resultado.erro || "A API recusou a verificação."
      );
    }
 
    const alturaMedida = Number(resultado.altura);
 
    console.log("Altura recebida:", alturaMedida);
 
    if (!Number.isFinite(alturaMedida)) {
      throw new Error("A API não retornou uma altura válida.");
    }

    atualizarSensor(ordem.sensorId, alturaMedida);

    if (alturaMedida >= 10) {
      setMensagemModalVerificacao(
        `A medição foi de ${alturaMedida} cm. A grama está em alerta ou nível crítico, então a ordem continua em andamento.`,
      );
      setModalGramaAlta(true);
      return;
    }
 
    const ordensAtualizadas = ordensServico.map((ordemAtual) =>
      ordemAtual.id === id
        ? {
            ...ordemAtual,
            status: "Concluída",
            alturaGrama: alturaMedida,
            dataConclusao: formatarData(new Date()),
          }
        : ordemAtual
    );
 
    await salvarOrdens(ordensAtualizadas);
 
    console.log("Ordem salva com sucesso.");
 
  } catch (erro) {
    console.error("ERRO NA VERIFICAÇÃO:", erro);
    setMensagemModalVerificacao(
      erro.message || "Não foi possível acessar a API Python.",
    );
    setModalGramaAlta(true);
  }
}
  function fecharModalOS() {
    setModalOS(false);
    setModalEquipe(false);
    setModalSensor(false);
    limparFormulario();
  }
 
  function formatarData(data) {
    return data.toLocaleDateString("pt-BR");
  }
 
  function adicionarUmMes(data) {
    const dataLimite = new Date(data);
    dataLimite.setMonth(dataLimite.getMonth() + 1);
    return dataLimite;
  }
 
  function obterDataLimite(sensor) {
    const dataCriacao = new Date();
    const sensorCritico =
      Number(sensor.grassHeight) >= 30 ||
      sensor.criticalDate === "Já está crítico";
 
    if (sensorCritico) {
      return formatarData(adicionarUmMes(dataCriacao));
    }
 
    return sensor.criticalDate || "Não disponível";
  }
 
  function enviarOrdemServico() {
    if (!equipe || !sensorSelecionado) {
      if (!equipe && !sensorSelecionado) {
        setMensagemValidacao("Escolha uma equipe e um sensor para continuar.");
      } else if (!equipe) {
        setMensagemValidacao("Escolha uma equipe para continuar.");
      } else {
        setMensagemValidacao("Escolha um sensor para continuar.");
      }
      return;
    }
 
    const novaOrdem = {
      id: Date.now(),
      equipe,
      sensorId: sensorSelecionado.id,
      rodovia: sensorSelecionado.highway,
      km: sensorSelecionado.km,
      alturaGrama: sensorSelecionado.grassHeight,
      dataCriacao: formatarData(new Date()),
      dataLimite: obterDataLimite(sensorSelecionado),
      status: "Pendente",
    };
 
    setOrdensServico((ordensAtuais) => [novaOrdem, ...ordensAtuais]);
    salvarOrdens([novaOrdem, ...ordensServico]);
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
 
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Ordens de Serviço</Text>
              <Text style={styles.subtitle}>
                {ordensExibidas.length === 0
                  ? "Nenhuma ordem criada ainda"
                  : `${ordensExibidas.length} ordem(ns) exibida(s)`}
              </Text>
            </View>
            {!isFuncionario && (
              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setModalOS(true)}
              >
                <Text style={styles.newButtonText}>+ Nova</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroOS === "andamento" && styles.filterButtonActive,
              ]}
              onPress={() => setFiltroOS("andamento")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filtroOS === "andamento" && styles.filterButtonTextActive,
                ]}
              >
                Em andamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroOS === "concluidas" && styles.filterButtonActive,
              ]}
              onPress={() => setFiltroOS("concluidas")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filtroOS === "concluidas" && styles.filterButtonTextActive,
                ]}
              >
                Concluídas
              </Text>
            </TouchableOpacity>
          </View>
          {notificacao && isFuncionario && (
            <TouchableOpacity
              style={styles.notification}
              onPress={() => setNotificacao("")}
            >
              <Text style={styles.newButtonText}>+ Nova</Text>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#166534"
              />
              <Text style={styles.notificationText}>{notificacao}</Text>
            </TouchableOpacity>
          )}
          {ordensExibidas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {filtroOS === "concluidas"
                  ? "Nenhuma ordem concluída"
                  : "Nenhuma ordem em andamento"}
              </Text>
              <Text style={styles.emptyText}>
                {filtroOS === "concluidas"
                  ? "As ordens concluídas aparecerão aqui."
                  : "Crie uma ordem para acompanhar as equipes e os trechos atendidos."}
              </Text>
            </View>
          ) : (
            ordensExibidas.map((ordem) => {
              const alturaAtual = obterAlturaAtual(ordem);
              const status = getGrassHeightStatus(alturaAtual);
              const statusLabel =
                status.label === "Normal"
                  ? "Altura ideal"
                  : status.label === "Atenção"
                    ? "Alerta"
                    : "Crítico";
 
              return (
                <View style={styles.orderCard} key={ordem.id}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>{ordem.equipe}</Text>
                    <Text
                      style={[
                        styles.orderStatus,
                        ordem.status === "Concluída" &&
                          styles.orderStatusCompleted,
                      ]}
                    >
                      {ordem.status || "Pendente"}
                    </Text>
                  </View>
                  <Text style={styles.orderInfo}>
                    Sensor: #{ordem.sensorId}
                  </Text>
                  <Text style={styles.orderInfo}>Rodovia: {ordem.rodovia}</Text>
                  <Text style={styles.orderInfo}>
                    KM: {Number(ordem.km).toFixed(1)}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Altura atual da grama: {alturaAtual} cm
                  </Text>
                  <View style={styles.orderSensorStatusRow}>
                    <Text style={styles.orderInfo}>Nível do sensor:</Text>
                    <View
                      style={[
                        styles.orderSensorStatus,
                        { backgroundColor: status.color },
                      ]}
                    >
                      <Text style={styles.orderSensorStatusText}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderInfo}>
                    Criada em: {ordem.dataCriacao}
                  </Text>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderInfo}>
                      Data limite para corte: {ordem.dataLimite}
                    </Text>
                    {!isFuncionario && (
                      <TouchableOpacity
                        onPress={() => deletarOrdemServico(ordem.id)}
                      >
                        <Ionicons name="trash-outline" size={24} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => abrirSensorNoMapa(ordem)}
                  >
                    <Ionicons name="map-outline" size={19} color="#5E22F3" />
                    <Text style={styles.mapButtonText}>Ver sensor no mapa</Text>
                  </TouchableOpacity>
                  {ordem.dataConclusao && (
                    <Text style={styles.orderInfo}>
                      Concluída em: {ordem.dataConclusao}
                    </Text>
                  )}
                  {isFuncionario && ordem.status !== "Concluída" && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => concluirOrdemServico(ordem.id)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color="#fff"
                      />
                      <Text style={styles.completeButtonText}>
                        Marcar como concluída
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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
                onPress={() => {
                  setMensagemValidacao("");
                  setModalEquipe(true);
                }}
              >
                <Text style={styles.selectText}>
                  {equipe || "Selecione uma equipe"}
                </Text>
              </TouchableOpacity>
 
              <Text style={styles.label}>Sensor</Text>
              <TouchableOpacity
                style={styles.select}
                onPress={() => {
                  setMensagemValidacao("");
                  setModalSensor(true);
                }}
              >
                <Text style={styles.selectText}>
                  {sensorSelecionado
                    ? `Sensor #${sensorSelecionado.id} - ${sensorSelecionado.highway}`
                    : "Selecione um sensor"}
                </Text>
              </TouchableOpacity>
 
              {sensorSelecionado && (
                <View style={styles.sensorPreview}>
                  <Text style={styles.previewText}>
                    Rodovia: {sensorSelecionado.highway}
                  </Text>
                  <Text style={styles.previewText}>
                    KM: {Number(sensorSelecionado.km).toFixed(1)}
                  </Text>
                  <Text style={styles.previewText}>
                    Data limite: {obterDataLimite(sensorSelecionado)}
                  </Text>
                </View>
              )}
 
              {mensagemValidacao && (
                <View style={styles.validationMessage}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#B91C1C"
                  />
                  <Text style={styles.validationText}>{mensagemValidacao}</Text>
                </View>
              )}
 
              <TouchableOpacity
                style={styles.submitButton}
                onPress={enviarOrdemServico}
              >
                <Text style={styles.submitButtonText}>
                  Criar ordem de serviço
                </Text>
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
        visible={modalSensor}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSensor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.teamModalContent}>
            <Text style={styles.modalTitle}>Escolha o sensor</Text>
            <ScrollView
              style={styles.sensorList}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {sensors.map((sensor) => {
                const status = getGrassHeightStatus(sensor.grassHeight);
                const statusLabel =
                  status.label === "Normal"
                    ? "Normal"
                    : status.label === "Atenção"
                      ? "Alerta"
                      : "Crítico";
 
                return (
                  <TouchableOpacity
                    key={sensor.id}
                    style={styles.sensorOption}
                    onPress={() => {
                      setSensorSelecionado(sensor);
                      setModalSensor(false);
                    }}
                  >
                    <View style={styles.sensorOptionHeader}>
                      <Text style={styles.sensorOptionTitle}>
                        Sensor #{sensor.id}
                      </Text>
                      <View
                        style={[
                          styles.sensorStatus,
                          { backgroundColor: status.color },
                        ]}
                      >
                        <Text style={styles.sensorStatusText}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.sensorOptionInfo}>
                      {sensor.highway} - KM {Number(sensor.km).toFixed(1)}
                    </Text>
                    <Text style={styles.sensorGrassHeight}>
                      Altura da grama: {sensor.grassHeight} cm
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalSensor(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
 
      <Modal
        visible={modalGramaAlta}
        transparent
        animationType="fade"
        onRequestClose={() => setModalGramaAlta(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="warning-outline" size={32} color="#F59E0B" />
            <Text style={styles.deleteModalTitle}>
              Tarefa não concluída
            </Text>
            <Text style={styles.deleteModalText}>
              {mensagemModalVerificacao ||
                "A ordem continua em andamento."}
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setModalGramaAlta(false)}
            >
              <Text style={styles.submitButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalExclusao}
        transparent
        animationType="fade"
        onRequestClose={() => setModalExclusao(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="trash-outline" size={32} color="#DC2626" />
            <Text style={styles.deleteModalTitle}>
              Excluir ordem de serviço?
            </Text>
            <Text style={styles.deleteModalText}>
              Essa ação não poderá ser desfeita.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setModalExclusao(false)}
              >
                <Text style={styles.deleteCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmarExclusao}
              >
                <Text style={styles.deleteConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
 
      <View style={styles.navigationContainer}>
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/sensors")}
          >
            <Ionicons name="radio-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sensores</Text>
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/map")}
          >
            <Ionicons name="map-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Mapa</Text>
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/home")}
          >
            <Ionicons name="home-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Home</Text>
          </TouchableOpacity>
 
          <TouchableOpacity style={styles.navButton}>
            <View style={styles.activeIcon}>
              <Ionicons name="document" size={24} color="#5E22F3" />
            </View>
            <Text style={styles.activeIconText}>OS</Text>
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              logout();
              router.push("/");
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#000" />
            <Text style={styles.iconText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  header: {
    backgroundColor: "#5E22F3",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { height: 100, width: 200, resizeMode: "contain" },
  content: { padding: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  notificationText: { flex: 1, color: "#166534", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 6 },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#5E22F3",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  filterButtonActive: { backgroundColor: "#5E22F3" },
  filterButtonText: {
    color: "#5E22F3",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: { color: "#fff" },
  newButton: {
    backgroundColor: "#5E22F3",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  newButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  sortContainer: { marginBottom: 20 },
  sortLabel: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  sortOptions: { flexDirection: "row", gap: 8 },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#5E22F3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  sortButtonActive: { backgroundColor: "#5E22F3" },
  sortButtonText: { color: "#5E22F3", fontSize: 13, fontWeight: "600" },
  sortButtonTextActive: { color: "#fff" },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#222" },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
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
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderTitle: { fontSize: 17, fontWeight: "bold", color: "#222" },
  orderStatus: { color: "#15803D", fontWeight: "600" },
  orderStatusCompleted: { color: "#2563EB" },
  orderInfo: { color: "#555", marginTop: 5, fontSize: 15 },
  completeButton: {
    backgroundColor: "#15803D",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 4,
  },
  completeButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  mapButton: {
    borderWidth: 1,
    borderColor: "#5E22F3",
    borderRadius: 8,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 4,
  },
  mapButtonText: { color: "#5E22F3", fontSize: 14, fontWeight: "bold" },
  orderSensorStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderSensorStatus: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  orderSensorStatusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
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
  select: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectText: { fontSize: 16, color: "#777" },
  sensorPreview: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  previewText: { color: "#555", fontSize: 14, marginBottom: 5 },
  validationMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  validationText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
  },
  kmContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  kmInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  kmText: { marginHorizontal: 10, fontSize: 15, color: "#555" },
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
  grassButtonText: { fontSize: 15, fontWeight: "600" },
  grassButtonSelected: { backgroundColor: "#5E22F3", borderColor: "#5E22F3" },
  grassButtonTextSelected: { color: "#fff" },
  submitButton: {
    backgroundColor: "#5E22F3",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
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
  sensorList: { maxHeight: 420, marginTop: 16 },
  sensorOption: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  sensorOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sensorOptionTitle: { color: "#222", fontSize: 16, fontWeight: "bold" },
  sensorStatus: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  sensorStatusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  sensorOptionInfo: { color: "#666", fontSize: 14, marginTop: 8 },
  sensorGrassHeight: {
    color: "#222",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  teamOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  teamOptionText: { fontSize: 16 },
  cancelButton: { marginTop: 15, padding: 12, alignItems: "center" },
  cancelButtonText: { color: "#5E22F3", fontSize: 16, fontWeight: "bold" },
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navigationBar: {
    height: 95,
    backgroundColor: "#fff",
    borderWidth: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -12 }],
  },
  activeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#5d22f244",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  iconText: { color: "#000", fontSize: 11, marginTop: 4 },
  activeIconText: { color: "#5E22F3", fontSize: 11, fontWeight: "bold" },
  deleteModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    padding: 24,
  },
  deleteModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: 12,
  },
  deleteModalText: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
  deleteModalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 24,
  },
  deleteCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
  },
  deleteCancelText: { color: "#555", fontWeight: "600" },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
  },
  deleteConfirmText: { color: "#fff", fontWeight: "bold" },
});
 