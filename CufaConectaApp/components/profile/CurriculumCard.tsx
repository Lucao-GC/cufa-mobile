import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as curriculosApi from "../../services/curriculosService";
import type { AnaliseCurriculo } from "../../types/api";
import { formatApiError } from "../../lib/formatApiError";

type Props = {
  filename: string | null;
  loading: boolean;
  onChanged: () => void;
};

export default function CurriculumCard({ filename, loading, onChanged }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [analise, setAnalise] = useState<AnaliseCurriculo | null>(null);

  async function handleAttach() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      await curriculosApi.uploadCurriculo({
        uri: asset.uri,
        name: asset.name ?? "curriculo.pdf",
        mimeType: asset.mimeType,
        file: asset.file,
      });
      Alert.alert("Sucesso", "Currículo enviado.");
      onChanged();
    } catch (err) {
      Alert.alert("Erro", formatApiError(err, { maxLength: 220 }));
    }
  }

  async function handleAnalyze() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];

      setAnalyzing(true);
      setAnalise(null);
      const data = await curriculosApi.analisarCurriculoPdf({
        uri: asset.uri,
        name: asset.name ?? "curriculo.pdf",
        mimeType: asset.mimeType,
        file: asset.file,
      });
      setAnalise(data);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Análise", formatApiError(err, { maxLength: 220 }));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Excluir currículo", "Confirma a exclusão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await curriculosApi.removerCurriculo();
            Alert.alert("Removido", "Currículo excluído.");
            onChanged();
          } catch (err) {
            Alert.alert("Erro", formatApiError(err, { maxLength: 220 }));
          }
        },
      },
    ]);
  }

  const display = filename && filename.length > 0 ? `📎 ${filename}` : "Nenhum arquivo anexado";

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#0B6B2F" style={{ marginBottom: 8 }} />
      ) : null}
      <Text style={styles.file}>{display}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primary} onPress={handleAttach}>
          <Text style={styles.textWhite}>Anexar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={handleDelete}
          disabled={!filename}
        >
          <Text style={[styles.textGreen, !filename && styles.textDisabled]}>Excluir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
        onPress={handleAnalyze}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textWhite}>Analisar currículo (PDF)</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Análise do currículo</Text>

            {analise ? (
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.section}>Resumo</Text>
                <Text style={styles.bodyText}>{analise.resumo}</Text>

                <Text style={styles.section}>Pontos fortes</Text>
                {analise.pontosFortes.map((item, i) => (
                  <Text key={`f-${i}`} style={styles.bodyText}>
                    • {item}
                  </Text>
                ))}

                <Text style={styles.section}>Melhorias</Text>
                {analise.pontosMelhoria.map((item, i) => (
                  <Text key={`m-${i}`} style={styles.bodyText}>
                    • {item}
                  </Text>
                ))}

                <Text style={styles.section}>Sugestões</Text>
                {analise.sugestoes.map((item, i) => (
                  <Text key={`s-${i}`} style={styles.bodyText}>
                    • {item}
                  </Text>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  file: {
    backgroundColor: "#E5EEE3",
    padding: 12,
    borderRadius: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  primary: {
    backgroundColor: "#0B6B2F",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#0B6B2F",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  analyzeBtn: {
    backgroundColor: "#0B6B2F",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  textWhite: {
    color: "#fff",
    fontWeight: "600",
  },
  /** Rótulo verde (botão Excluir) */
  textGreen: {
    color: "#0B6B2F",
    fontWeight: "600",
  },
  textDisabled: {
    opacity: 0.45,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    color: "#0B6B2F",
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginTop: 12,
    fontWeight: "700",
    fontSize: 15,
    color: "#222",
  },
  bodyText: {
    marginTop: 4,
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  modalActions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  btnClose: {
    backgroundColor: "#0B6B2F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnCloseText: {
    color: "#fff",
    fontWeight: "800",
  },
});
