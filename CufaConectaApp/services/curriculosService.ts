import { Platform } from "react-native";

import type { AnaliseCurriculo, AnaliseCurriculoResponse, CurriculoInfo } from "../types/api";
import { api, axiosFormDataConfig } from "./api";

export type CurriculoUploadPick = {
  uri: string;
  name: string;
  mimeType?: string | null;
  /** Preenchido no web pelo expo-document-picker (`asset.file`). */
  file?: File | Blob;
};

async function appendCurriculoFilePart(form: FormData, pick: CurriculoUploadPick) {
  const filename = pick.name?.trim() || "curriculo.pdf";

  if (pick.file != null) {
    form.append("file", pick.file, filename);
    return;
  }

  if (Platform.OS === "web") {
    const res = await fetch(pick.uri);
    const blob = await res.blob();
    form.append("file", blob, filename);
    return;
  }

  form.append(
    "file",
    {
      uri: pick.uri,
      name: filename,
      type: pick.mimeType ?? "application/pdf",
    } as unknown as Blob
  );
}

/** Backend POST /curriculos/update devolve texto (URL); POST /upload devolve JSON { filename }. */
function normalizeCurriculoUpload(data: unknown): CurriculoInfo {
  if (typeof data === "string") {
    const url = data.trim();
    const filename = url.includes("/") ? (url.split("/").pop() ?? url) : url;
    return { filename: filename || "" };
  }
  if (data && typeof data === "object" && "filename" in (data as object)) {
    return data as CurriculoInfo;
  }
  return { filename: "" };
}

export async function getCurriculoArquivo() {
  const { data } = await api.get<CurriculoInfo>("/curriculos");
  return data;
}

export async function uploadCurriculo(pick: CurriculoUploadPick) {
  const form = new FormData();
  await appendCurriculoFilePart(form, pick);

  const { data } = await api.post<unknown>("/curriculos/update", form, axiosFormDataConfig());
  return normalizeCurriculoUpload(data);
}

export async function removerCurriculo() {
  await api.delete("/curriculos");
}

/** POST /curriculos/analisar (multipart `file`) — exige Ollama no backend quando configurado. */
export async function analisarCurriculoPdf(pick: CurriculoUploadPick): Promise<AnaliseCurriculo> {
  const form = new FormData();
  await appendCurriculoFilePart(form, pick);

  const { data } = await api.post<AnaliseCurriculoResponse>(
    "/curriculos/analisar",
    form,
    axiosFormDataConfig()
  );
  return data.analise;
}
