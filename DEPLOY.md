# 🚀 Guía de Despliegue - Bot de WhatsApp

## 📋 Opciones de Hosting

### 🌟 1. Railway (Recomendado)

**Por qué Railway:**
- ✅ Deploy automático desde GitHub
- ✅ Variables de entorno seguras
- ✅ Dominio HTTPS automático
- ✅ Plan gratuito generoso

**Pasos:**
1. Sube tu código a GitHub
2. Ve a [Railway.app](https://railway.app)
3. Conecta tu repositorio
4. Configura variables de entorno:
   ```
   META_WABA_TOKEN=tu_token_real
   VERIFY_TOKEN=mi_token_webhook
   PHONE_NUMBER_ID=663926513474380
   PORT=3000
   ```
5. Deploy automático ✅

### 🔧 2. Heroku

**Pasos:**
1. Instala Heroku CLI
2. ```bash
   heroku create tu-bot-whatsapp
   heroku config:set META_WABA_TOKEN=tu_token_real
   heroku config:set VERIFY_TOKEN=mi_token_webhook
   heroku config:set PHONE_NUMBER_ID=663926513474380
   git push heroku main
   ```

### ⚡ 3. Vercel

**Pasos:**
1. Instala Vercel CLI: `npm i -g vercel`
2. ```bash
   vercel
   vercel env add META_WABA_TOKEN
   vercel env add VERIFY_TOKEN
   vercel env add PHONE_NUMBER_ID
   vercel --prod
   ```

## 🔐 Configuración de Variables de Entorno

**En tu plataforma de hosting, configura:**

```bash
META_WABA_TOKEN=EAAPBUoZBLW1UBPpZBqrHNQF1z8p7dr3ZCtvmBmbeZCUZAxFALZCXSGAsRYyLfm2aG765Ya425uRvHVYWpdOyROgUuvqwUPydT6GIJxt36An4KzCuEGwwk0s5VeQepeNxalWDnjZCdGtr1UTZAL665ZBweQZBiR7l3bPZCLXpvynEJwDDu5zbhqHHY6juKakX8LTivCpnx7ZByotnv8jVIODZAzmaMwg1IJhTJBEgG6aKTZAhc5Y8IZD
VERIFY_TOKEN=mi_token_webhook
PHONE_NUMBER_ID=663926513474380
PORT=3000
```

## 🌐 Configurar Webhook en Meta

**Una vez deployado:**

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Selecciona tu app de WhatsApp Business
3. Ve a **WhatsApp > Configuración**
4. En **Webhook**:
   - **URL:** `https://tu-app.railway.app/webhook`
   - **Token:** `mi_token_webhook`
   - **Eventos:** Marca `messages`
5. Haz clic en **Verificar y guardar**

## ✅ Verificación

**Endpoints a probar:**
- `https://tu-app.com/` - Info del bot
- `https://tu-app.com/send-demo?to=543515747073` - Enviar demo

## 🔧 Monitoreo

**Logs en Railway:**
- Dashboard > tu-app > Deployments > View Logs

**Logs en Heroku:**
```bash
heroku logs --tail
```

## 🚨 Troubleshooting

### Error: "Webhook verification failed"
- Verifica que el `VERIFY_TOKEN` sea exactamente `mi_token_webhook`
- Asegúrate de que la URL termine en `/webhook`

### Error: "Cannot parse access token"
- Verifica que `META_WABA_TOKEN` esté configurado correctamente
- El token no debe tener espacios al inicio o final

### Error: "Recipient not in allowed list"
- Agrega el número en Meta for Developers
- Formato: `+54 351 574-7073`

## 📱 Producción

**Para uso en producción:**
1. **Solicita revisión de la app** en Meta
2. **Agrega más números** a la lista permitida
3. **Configura dominios** personalizados
4. **Implementa rate limiting**
5. **Agrega logging** avanzado
6. **Configura backups** de la base de datos (si usas una)

---

**🎉 ¡Tu bot de WhatsApp está listo para producción!**
