import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SCAN_SIZE = 230;

const SCAN_LEFT = (SCREEN_WIDTH - SCAN_SIZE) / 2;
const SCAN_TOP = (SCREEN_HEIGHT - SCAN_SIZE) / 2;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // ---------------------------------------------------
  // SPOTIFY EMBED
  // ---------------------------------------------------

  const spotifyHTML = trackId
    ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
          }

          #embed-iframe {
            width: 100%;
            height: 152px;
          }
        </style>
      </head>

      <body>

        <div id="embed-iframe"></div>

        <script src="https://open.spotify.com/embed/iframe-api/v1"></script>

        <script>
          let controller = null;

          window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const element =
              document.getElementById('embed-iframe');

            const options = {
              uri: 'spotify:track:${trackId}',
              width: '100%',
              height: '152'
            };

            IFrameAPI.createController(
              element,
              options,
              (EmbedController) => {

                controller = EmbedController;

                controller.addListener(
                  'ready',
                  () => {
                    window.ReactNativeWebView.postMessage(
                      JSON.stringify({
                        type: 'READY'
                      })
                    );
                  }
                );

                controller.addListener(
                  'playback_started',
                  () => {
                    window.ReactNativeWebView.postMessage(
                      JSON.stringify({
                        type: 'PLAYING'
                      })
                    );
                  }
                );

                controller.addListener(
                  'playback_update',
                  (event) => {
                    if (event?.data?.isPaused) {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                          type: 'PAUSED'
                        })
                      );
                    }
                  }
                );
              }
            );
          };

          function handleCommand(command) {
            if (!controller) return;

            if (command === 'PLAY') {
              controller.play();
            }

            if (command === 'PAUSE') {
              controller.pause();
            }

            if (command === 'RESTART') {
              controller.restart();
            }
          }

          document.addEventListener(
            'message',
            function(event) {
              handleCommand(event.data);
            }
          );

          window.addEventListener(
            'message',
            function(event) {
              handleCommand(event.data);
            }
          );
        </script>

      </body>
    </html>
    `
    : '';

  // ---------------------------------------------------
  // ESCANEAR QR
  // ---------------------------------------------------

  const handleBarcodeScanned = ({
    data,
    bounds,
  }: {
    data: string;
    bounds?: {
      origin: {
        x: number;
        y: number;
      };
      size: {
        width: number;
        height: number;
      };
    };
  }) => {
    if (scannedUrl) return;

    if (!bounds) return;

    const qrCenterX =
      bounds.origin.x + bounds.size.width / 2;

    const qrCenterY =
      bounds.origin.y + bounds.size.height / 2;

    const insideHorizontal =
      qrCenterX >= SCAN_LEFT &&
      qrCenterX <= SCAN_LEFT + SCAN_SIZE;

    const insideVertical =
      qrCenterY >= SCAN_TOP &&
      qrCenterY <= SCAN_TOP + SCAN_SIZE;

    if (!insideHorizontal || !insideVertical) {
      return;
    }

    const match =
      data.match(/track\/([a-zA-Z0-9]+)/);

    if (!match) {
      alert(
        'El QR dentro del recuadro no corresponde a una canción de Spotify.'
      );

      return;
    }

    const id = match[1];

    console.log('QR escaneado:', data);
    console.log('Spotify Track ID:', id);

    setScannedUrl(data);
    setTrackId(id);

    setIsReady(false);
    setIsFlipped(false);
    setIsPlaying(false);
  };

  // ---------------------------------------------------
  // MENSAJES DE SPOTIFY
  // ---------------------------------------------------

  const handleSpotifyMessage = (event: any) => {
    try {
      const message =
        JSON.parse(event.nativeEvent.data);

      console.log(
        'Spotify WebView:',
        message
      );

      if (message.type === 'READY') {
        setIsReady(true);
      }

      if (message.type === 'PLAYING') {
        setIsPlaying(true);
      }

      if (message.type === 'PAUSED') {
        setIsPlaying(false);
      }
    } catch (error) {
      console.log(
        'Mensaje WebView:',
        event.nativeEvent.data
      );
    }
  };

  // ---------------------------------------------------
  // ACELERÓMETRO
  // ---------------------------------------------------

  useEffect(() => {
    let subscription:
      | { remove: () => void }
      | null = null;

    if (
      isReady &&
      !isFlipped &&
      trackId
    ) {
      Accelerometer.setUpdateInterval(250);

      subscription =
        Accelerometer.addListener(
          ({ z }) => {
            if (z < -0.7) {
              console.log(
                'Teléfono boca abajo'
              );

              setIsFlipped(true);

              webViewRef.current?.postMessage(
                'PLAY'
              );
            }
          }
        );
    }

    return () => {
      subscription?.remove();
    };
  }, [
    isReady,
    isFlipped,
    trackId,
  ]);

  // ---------------------------------------------------
  // PAUSA / PLAY
  // ---------------------------------------------------

  const togglePlayback = () => {
    if (!isReady) return;

    if (isPlaying) {
      webViewRef.current?.postMessage(
        'PAUSE'
      );

      setIsPlaying(false);
    } else {
      webViewRef.current?.postMessage(
        'PLAY'
      );

      setIsPlaying(true);
    }
  };

  // ---------------------------------------------------
  // SIGUIENTE CARTA
  // ---------------------------------------------------

  const resetGame = () => {
    webViewRef.current?.postMessage(
      'PAUSE'
    );

    setScannedUrl(null);
    setTrackId(null);

    setIsReady(false);
    setIsFlipped(false);
    setIsPlaying(false);
  };

  // ---------------------------------------------------
  // PERMISOS
  // ---------------------------------------------------

  if (!permission) {
    return (
      <View style={styles.container} />
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a tu cámara
          para escanear las cartas.
        </Text>

        <View style={styles.permissionButton}>
          <Button
            title="Otorgar permiso"
            onPress={requestPermission}
            color="#0039A6"
          />
        </View>
      </View>
    );
  }

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <View style={styles.container}>

      {!scannedUrl ? (

        // ======================================
        // CÁMARA
        // ======================================

        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={
            handleBarcodeScanned
          }
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >

          <View
            style={styles.cameraOverlay}
          >

            <View style={styles.cameraHeader}>
              <Text style={styles.logoText}>
                Chilster 🇨🇱
              </Text>

              <Text style={styles.logoSubtitle}>
                Solo música chilena
              </Text>
            </View>

            <View
              style={styles.topShade}
            />

            <View
              style={styles.middleRow}
            >

              <View
                style={styles.sideShade}
              />

              <View
                style={styles.scanBox}
              >

                <View
                  style={[
                    styles.corner,
                    styles.topLeft,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.topRight,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.bottomLeft,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.bottomRight,
                  ]}
                />

              </View>

              <View
                style={styles.sideShade}
              />

            </View>

            <View
              style={styles.bottomShade}
            >

              <Text
                style={styles.scanText}
              >
                Apunta al QR dentro del recuadro
              </Text>

            </View>

          </View>

        </CameraView>

      ) : (

        // ======================================
        // JUEGO
        // ======================================

        <View
          style={styles.resultContainer}
        >

          {!isReady ? (

            <>
              <Text style={styles.smallStar}>
                ★
              </Text>

              <Text
                style={styles.resultText}
              >
                Cargando Spotify...
              </Text>
            </>

          ) : !isFlipped ? (

            <>
              <Text style={styles.smallStar}>
                ★
              </Text>

              <Text
                style={styles.resultText}
              >
                ¡Canción lista!
              </Text>

              <Text
                style={styles.instructionText}
              >
                Pon el teléfono boca abajo
              </Text>
            </>

          ) : (

            <>
              <Text style={styles.bigStar}>
                ★
              </Text>

              <Text
                style={styles.resultText}
              >
                Adivina la canción
              </Text>

              <Text
                style={styles.instructionText}
              >
                {isPlaying
                  ? 'Reproduciendo'
                  : 'Pausada'}
              </Text>
            </>

          )}

          {/* SPOTIFY CARGA SIEMPRE,
              PERO SOLO SE VE DESPUÉS DE GIRAR */}

          {trackId && (

            <View
              style={
                isFlipped
                  ? styles.spotifyPlayer
                  : styles.spotifyPlayerHidden
              }
            >

              <WebView
                ref={webViewRef}

                originWhitelist={['*']}

                source={{
                  html: spotifyHTML,
                }}

                javaScriptEnabled={true}

                domStorageEnabled={true}

                allowsInlineMediaPlayback={true}

                mediaPlaybackRequiresUserAction={
                  false
                }

                onMessage={
                  handleSpotifyMessage
                }

                mixedContentMode="always"

                scrollEnabled={false}
              />

            </View>

          )}

          {/* PLAY / PAUSA */}

          {isReady && isFlipped && (

            <View
              style={styles.playButton}
            >

              <Button
                title={
                  isPlaying
                    ? 'Pausar canción'
                    : 'Seguir reproduciendo'
                }
                onPress={togglePlayback}
                color="#0039A6"
              />

            </View>

          )}

          <View
            style={
              styles.buttonContainer
            }
          >

            <Button
              title="Siguiente carta"
              onPress={resetGame}
              color="#0039A6"
            />

          </View>

        </View>

      )}

    </View>
  );
}

// ---------------------------------------------------
// ESTILOS
// ---------------------------------------------------

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#651A22',
    justifyContent: 'center',
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    flex: 1,
  },

  cameraHeader: {
    backgroundColor: 'rgba(101,26,34,0.93)',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 18,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  logoSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },

  topShade: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.58)',
  },

  middleRow: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },

  sideShade: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.58)',
  },

  scanBox: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
  },

  bottomShade: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.58)',
    alignItems: 'center',
    paddingTop: 30,
  },

  scanText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  corner: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderColor: '#FFFFFF',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  permissionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    margin: 30,
  },

  permissionButton: {
    width: '70%',
    alignSelf: 'center',
  },

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#651A22',
  },

  smallStar: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
  },

  bigStar: {
    fontSize: 58,
    color: '#FFFFFF',
    marginBottom: 12,
  },

  resultText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },

  instructionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },

  spotifyPlayer: {
    width: '92%',
    height: 152,
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },

  spotifyPlayerHidden: {
    position: 'absolute',
    width: 2,
    height: 2,
    opacity: 0.01,
    bottom: 0,
    left: 0,
  },

  playButton: {
    marginTop: 20,
    width: '70%',
  },

  buttonContainer: {
    marginTop: 25,
    width: '70%',
  },

});