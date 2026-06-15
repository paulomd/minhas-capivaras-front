export const APP_MESSAGE_STORAGE_KEY = "maisrecorrencia_app_message";
export const APP_MESSAGE_EVENT = "maisrecorrencia:app-message";

export type AppMessage = {
  text: string;
};

export function enfileirarMensagemApp(text: string): void {
  sessionStorage.setItem(
    APP_MESSAGE_STORAGE_KEY,
    JSON.stringify({ text } satisfies AppMessage),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(APP_MESSAGE_EVENT));
  }
}

export function consumirMensagemApp(): AppMessage | null {
  const raw = sessionStorage.getItem(APP_MESSAGE_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(APP_MESSAGE_STORAGE_KEY);
  try {
    return JSON.parse(raw) as AppMessage;
  } catch {
    return null;
  }
}
