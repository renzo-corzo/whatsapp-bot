import axios from "axios";

const GRAPH_BASE = process.env.WHATSAPP_GRAPH_BASE || "https://graph.facebook.com";
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; // long-lived

function redact(str = "") {
  return String(str).replace(/(EA[A-Za-z0-9]{20,})/g, "REDACTED");
}

export async function sendWhatsApp(payload) {
  try {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      console.error("[WA] config faltante: PHONE_NUMBER_ID/ACCESS_TOKEN");
      return { ok: false, error: "config" };
    }

    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;

    // NO setear Content-Length / Accept-Encoding. Dejar que Axios lo maneje.
    const { data } = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 20000,
      validateStatus: s => s >= 200 && s < 500 // capturar 401/4xx sin throw
    });

    if (data?.error) {
      const code = data.error.code;
      const type = data.error.type;
      const message = data.error.message;
      const details = data.error.error_data?.details;
      console.warn(`[WA] Graph error ${code}/${type}: ${message}${details ? " – " + details : ""}`);
      // 401/190/131009 se devuelven limpias al caller
      return { ok: false, status: 400, error: { code, type, message, details } };
    }

    console.log("[WA] enviado ok");
    return { ok: true, data };
  } catch (err) {
    // Log conciso y SIN volcar objetos enormes
    const status = err?.response?.status;
    const msg = err?.message;
    console.error(`[WA] fallo axios status=${status || "?"} msg=${msg}`);
    // Nunca loggear Authorization ni request completo
    return { ok: false, status: status || 500, error: { message: msg } };
  }
}
