import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import Colorpath from '../../../Themes/Colorpath';
import { SecurityNotice } from '../../../Components/security/SecurityNotice';
import { axiosInstance } from '../../../Utils/Helpers/ApiRequest';
import { toDisplayText } from '../utils/courseHelpers';

type DocumentPdfModalProps = {
    showModal: boolean;
    onClose: () => void;
    documentId: string | null;
    title: string;
};

// Convert ArrayBuffer to Base64 in JavaScript without external native modules
function arrayBufferToBase64(data: any): string {
    if (typeof data === 'string') {
        if (data.startsWith('data:')) {
            return data.split(',')[1] || data;
        }
        return data;
    }
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const runtimeGlobal = globalThis as any;
    if (typeof runtimeGlobal.btoa === 'function') {
        return runtimeGlobal.btoa(binary);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64 = '';
    let i = 0;
    while (i < len) {
        const b1 = bytes[i++];
        const b2 = i < len ? bytes[i++] : NaN;
        const b3 = i < len ? bytes[i++] : NaN;
        const enc1 = b1 >> 2;
        const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
        let enc3 = ((b2 & 15) << 2) | (b3 >> 6);
        let enc4 = b3 & 63;
        if (isNaN(b2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(b3)) {
            enc4 = 64;
        }
        base64 +=
            chars.charAt(enc1) +
            chars.charAt(enc2) +
            (enc3 === 64 ? '=' : chars.charAt(enc3)) +
            (enc4 === 64 ? '=' : chars.charAt(enc4));
    }
    return base64;
}

export function DocumentPdfModal({
    showModal,
    onClose,
    documentId,
    title,
}: DocumentPdfModalProps) {
    const [loading, setLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!showModal || !documentId) {
            setPdfBase64(null);
            setErrorMsg(null);
            setLoading(false);
            return;
        }

        async function fetchPdfDocument() {
            setLoading(true);
            setErrorMsg(null);
            setPdfBase64(null);

            try {
                const response = await axiosInstance.get(`documents/student/stream/${documentId}`, {
                    responseType: 'arraybuffer',
                    headers: {
                        Accept: 'application/pdf',
                        'Cache-Control': 'private, no-store, max-age=0',
                    },
                });

                if (!isMounted) return;

                if (response.status === 200 && response.data) {
                    const base64 = arrayBufferToBase64(response.data);
                    setPdfBase64(base64);
                } else {
                    setErrorMsg('Unable to load document content.');
                }
            } catch (err: any) {
                if (!isMounted) return;

                const status = err?.response?.status;
                if (status === 401) {
                    setErrorMsg('Your session has expired. Please log in again.');
                    Toast.show({ type: 'error', text1: 'Your session has expired. Please log in again.' });
                } else if (status === 403) {
                    setErrorMsg('You do not have access to this study material.');
                    Toast.show({ type: 'error', text1: 'You do not have access to this study material.' });
                } else if (status === 404) {
                    setErrorMsg('Study material not found.');
                    Toast.show({ type: 'error', text1: 'Study material not found.' });
                } else {
                    setErrorMsg('Unable to load this material. Please try again.');
                    Toast.show({ type: 'error', text1: 'Unable to load this material. Please try again.' });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void fetchPdfDocument();

        return () => {
            isMounted = false;
        };
    }, [showModal, documentId]);

    const handleClose = () => {
        setPdfBase64(null);
        setErrorMsg(null);
        setLoading(false);
        onClose();
    };

    const buildPdfHtml = (base64: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #1E293B; display: flex; flex-direction: column; align-items: center; user-select: none; -webkit-user-select: none; }
    #container { width: 100%; display: flex; flex-direction: column; align-items: center; padding: 12px 0 24px 0; }
    canvas { margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); max-width: 96%; height: auto !important; border-radius: 4px; }
    .status-text { color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; margin-top: 40px; }
  </style>
</head>
<body>
  <div id="container">
    <div id="status" class="status-text">Loading Document...</div>
  </div>
  <script>
    (function() {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdfData = atob("${base64}");
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        
        loadingTask.promise.then(function(pdf) {
          const statusEl = document.getElementById('status');
          if (statusEl) statusEl.style.display = 'none';
          const container = document.getElementById('container');
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              container.appendChild(canvas);
              
              const renderContext = { canvasContext: context, viewport: viewport };
              page.render(renderContext);
            });
          }
        }).catch(function(err) {
          document.getElementById('status').innerText = 'Unable to render PDF document.';
        });
      } catch(e) {
        document.getElementById('status').innerText = 'Error loading document content.';
      }
    })();
  </script>
</body>
</html>
`;

    const webViewSource = Platform.OS === 'ios' && pdfBase64
        ? { uri: `data:application/pdf;base64,${pdfBase64}` }
        : { html: buildPdfHtml(pdfBase64 || ''), baseUrl: 'https://cdnjs.cloudflare.com' };

    return (
        <Modal
            visible={showModal}
            transparent={false}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={pdfStyles.container}>
                <SafeAreaView edges={['top']} style={pdfStyles.safeArea}>
                    <View style={pdfStyles.header}>
                        <View style={pdfStyles.headerTextWrap}>
                            <Text style={pdfStyles.headerLabel}>PROTECTED STUDY MATERIAL</Text>
                            <Text style={pdfStyles.headerTitle} numberOfLines={1}>
                                {toDisplayText(title, 'PDF Document')}
                            </Text>
                        </View>
                        <Pressable onPress={handleClose} style={pdfStyles.closeBtn}>
                            <Feather name="x" size={normalize(22)} color="#0F172A" />
                        </Pressable>
                    </View>

                    <View style={pdfStyles.noticeWrap}>
                        <SecurityNotice text="Protected Document. Downloads, external opening, and sharing are disabled." />
                    </View>
                </SafeAreaView>

                <View style={pdfStyles.content}>
                    {loading ? (
                        <View style={pdfStyles.centeredState}>
                            <ActivityIndicator size="large" color={Colorpath.Primary} />
                            <Text style={pdfStyles.loadingText}>Loading Document...</Text>
                        </View>
                    ) : errorMsg ? (
                        <View style={pdfStyles.centeredState}>
                            <Feather name="alert-circle" size={normalize(32)} color="#EF4444" />
                            <Text style={pdfStyles.errorText}>{errorMsg}</Text>
                            <Pressable onPress={handleClose} style={pdfStyles.retryBtn}>
                                <Text style={pdfStyles.retryBtnText}>Close</Text>
                            </Pressable>
                        </View>
                    ) : pdfBase64 ? (
                        <WebView
                            originWhitelist={['*']}
                            onShouldStartLoadWithRequest={(request) => {
                                const reqUrl = String(request.url || '');
                                if (
                                    reqUrl === 'about:blank' ||
                                    reqUrl.startsWith('data:') ||
                                    reqUrl.includes('cdnjs.cloudflare.com') ||
                                    reqUrl.startsWith('file://')
                                ) {
                                    return true;
                                }
                                return false;
                            }}
                            setSupportMultipleWindows={false}
                            allowsLinkPreview={false}
                            allowFileAccess={true}
                            allowFileAccessFromFileURLs={true}
                            allowUniversalAccessFromFileURLs={true}
                            source={webViewSource}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            nestedScrollEnabled
                            style={pdfStyles.webView}
                        />
                    ) : (
                        <View style={pdfStyles.centeredState}>
                            <Text style={pdfStyles.loadingText}>No document data available.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const pdfStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    headerTextWrap: {
        flex: 1,
        marginRight: normalize(12),
    },
    headerLabel: {
        fontSize: normalize(10),
        fontFamily: 'Inter-Bold',
        fontWeight: '700',
        color: '#0F766E',
        letterSpacing: 0.8,
        marginBottom: verticalScale(2),
    },
    headerTitle: {
        fontSize: normalize(16),
        fontFamily: 'Inter-Bold',
        fontWeight: '700',
        color: '#0F172A',
    },
    closeBtn: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noticeWrap: {
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(8),
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    content: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    webView: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(24),
    },
    loadingText: {
        marginTop: verticalScale(12),
        fontSize: normalize(14),
        color: '#94A3B8',
        fontFamily: 'Inter-Medium',
    },
    errorText: {
        marginTop: verticalScale(12),
        fontSize: normalize(14),
        color: '#FCA5A5',
        textAlign: 'center',
        fontFamily: 'Inter-Medium',
        lineHeight: normalize(20),
    },
    retryBtn: {
        marginTop: verticalScale(16),
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(10),
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(10),
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontFamily: 'Inter-Bold',
        fontWeight: '700',
    },
});
