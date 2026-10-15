# Chilster 🇨🇱 (Hitster Chileno)

> **El juego de cartas y música chilena donde escuchas, recuerdas y ordenas las canciones en tu línea de tiempo musical.**

Inspirado en la mecánica del popular juego de mesa **Hitster**, **Chilster** adapta toda la experiencia al cancionero popular chileno (rock, cumbia, pop, folklore, nueva ola, rap y más). Los jugadores compiten por armar su línea de tiempo cronológica adivinando en qué año se lanzaron los grandes éxitos de la música nacional.

---

## 📲 Descargar App para Android (APK v1.0.0)

Puedes descargar e instalar directamente la aplicación en tu celular Android desde los lanzamientos oficiales:

👉 **[Descargar Chilster v1.0.0 (APK)](https://github.com/Renvto21/chilster/releases/latest)**

* **Versión:** `v1.0.0`
* **Archivo:** `Chilster-v1.0.0.apk`
* **Instalación:** Descarga el archivo en tu dispositivo Android y ejecútalo para instalar (si el sistema lo solicita, habilita la opción de "Instalar aplicaciones desconocidas").

---

## 🎯 ¿Cómo se juega?

1. **Roba una carta:** Toma una carta física del mazo. En el frente está el nombre del tema, el artista y el año de lanzamiento (que nadie debe ver). En el reverso hay un código QR de Spotify.
2. **Escanea con Chilster:** Abre la aplicación y apunta con la cámara al código QR de la carta.
3. **Pon el teléfono boca abajo:** La app cargará la canción en segundo plano y te indicará: *"¡Canción lista! Pon el teléfono boca abajo"*.
4. **Música automática:** Gracias al acelerómetro del teléfono, al ponerlo boca abajo sobre la mesa, la música comienza a reproducirse sola. Así ningún jugador puede espiar la pantalla ni ver el título del tema.
5. **Adivina y desafía:** Los jugadores escuchan el tema y deciden en qué posición de su línea de tiempo cronológica colocar la carta. Al voltear la carta física, se comprueba el año.

---

## ✨ Características Técnicas

* 📱 **Desarrollado en React Native y Expo** (TypeScript).
* 📷 **Escáner QR focalizado (`expo-camera`):** Retícula de escaneo optimizada con validación inmediata de enlaces de Spotify.
* 🔄 **Sensor de volteo con acelerómetro (`expo-sensors`):** Detecta la orientación física del teléfono (eje Z) para reproducir automáticamente sin intervención táctil ni filtración visual.
* 🎵 **Reproducción Spotify sin API Keys:** Integra el Iframe Player API oficial de Spotify dentro de un `react-native-webview`, reproduciendo la vista previa de las canciones sin exponer credenciales ni requerir autenticación externa.
* 🇨🇱 **Identidad visual chilena:** Paleta de colores patrios y diseño minimalista adaptado para partidas rápidas.

---

## 📁 Estructura del Repositorio

```text
hitster-app/
├── cartas/                 # Cartas físicas listas para imprimir (203 canciones con QR)
│   ├── Cartas_Chilster_Parte1_Canciones_1_a_105.docx
│   ├── Cartas_Chilster_Parte2_Canciones_106_a_203.docx
│   ├── LISTA_CANCIONES.md  # Índice completo de canciones
│   └── README.md           # Guía de impresión y armado
├── assets/                 # Iconos, splash screen y recursos gráficos
│   └── images/
├── src/
│   └── app/
│       ├── _layout.tsx     # Configuración de rutas limpias (Expo Router)
│       └── index.tsx       # Lógica central: cámara, acelerómetro, Spotify y UI
├── app.json                # Configuración de Expo y metadatos de la aplicación
├── package.json            # Dependencias del proyecto
└── tsconfig.json           # Configuración de TypeScript
```

---

## 🚀 Cómo ejecutar el proyecto localmente

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior).
* La aplicación **Expo Go** instalada en tu teléfono móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iOS](https://apps.apple.com/app/expo-go/id982107779)).

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Renvto21/chilster.git
   cd chilster
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar la aplicación con Expo:**
   ```bash
   npx expo start
   ```

4. **Abrir en tu dispositivo:**
   * Escanea el código QR que aparece en tu terminal usando la cámara de tu teléfono (iOS) o la app **Expo Go** (Android).
   * Asegúrate de que tu computador y tu teléfono estén conectados a la misma red Wi-Fi.

---

## 📦 Generación de APK (Opcional con EAS Build)

El proyecto incluye la configuración en `eas.json` lista para compilar un archivo `.apk` para Android:

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

---

## 🎴 Cartas Imprimibles (203 Canciones Chilenas)

El juego incluye **203 cartas listas para imprimir** con sus códigos QR de Spotify generados y listados:

* 📄 **[Cartas Parte 1 (Canciones 1 a 105)](./cartas/Cartas_Chilster_Parte1_Canciones_1_a_105.docx)** (.docx listo para imprimir)
* 📄 **[Cartas Parte 2 (Canciones 106 a 203)](./cartas/Cartas_Chilster_Parte2_Canciones_106_a_203.docx)** (.docx listo para imprimir)
* 📋 **[Ver Lista Completa de Canciones](./cartas/LISTA_CANCIONES.md)** (Violeta Parra, Los Prisioneros, Los Jaivas, Los Bunkers, Mon Laferte, Polimá Westcoast, Pailita, etc.)
* 🛠️ Instrucciones de corte y armado en [`cartas/README.md`](./cartas/README.md).

---

## 👨‍💻 Autor

Creado por [Renato Arriagada](https://github.com/Renvto21).
