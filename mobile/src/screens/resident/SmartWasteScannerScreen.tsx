import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { classifyWaste, WasteClassificationResult } from '../../api/ai.api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const DUSTBIN_INFO: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Green: { label: 'Green Bin', color: '#065f46', bg: '#ecfdf5', icon: 'leaf' },
  Blue: { label: 'Blue Bin', color: '#1e40af', bg: '#eff6ff', icon: 'water' },
  Yellow: { label: 'Yellow Bin', color: '#92400e', bg: '#fffbeb', icon: 'reload' },
  Red: { label: 'Red Bin', color: '#991b1b', bg: '#fef2f2', icon: 'warning' },
  Black: { label: 'Black Bin', color: '#1f2937', bg: '#f3f4f6', icon: 'trash' },
};

const getDustbinInfo = (dustbinColor: string | undefined) => {
  if (!dustbinColor) return null;
  const key = Object.keys(DUSTBIN_INFO).find(
    (k) => k.toLowerCase() === dustbinColor.toLowerCase()
  );
  return key ? DUSTBIN_INFO[key] : null;
};

const LoadingDots = () => {
  const [dot] = useState(() => new Animated.Value(0));

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#10B981',
            marginHorizontal: 2,
            opacity: dot.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          }}
        />
      ))}
    </View>
  );
};

const LoadingStep = ({ icon, text, isActive }: { icon: any; text: string; isActive: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, opacity: isActive ? 1 : 0.4 }}>
    <View style={{
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: isActive ? '#ecfdf5' : '#f8fafc',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Ionicons name={icon} size={18} color={isActive ? '#10B981' : '#94a3b8'} />
    </View>
    <Text style={{
      marginLeft: 12, fontSize: 14, fontWeight: isActive ? '700' : '500',
      color: isActive ? '#0F172A' : '#94a3b8',
    }}>
      {text}
    </Text>
    {isActive && <LoadingDots />}
  </View>
);

export const SmartWasteScannerScreen = ({ navigation }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const reset = useCallback(() => {
    setImageUri(null);
    setBase64Data(null);
    setAnalyzing(false);
    setResult(null);
    setError(null);
    setActiveStep(0);
  }, []);

  const pickImage = useCallback(async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Permission required to access ' + (useCamera ? 'camera' : 'gallery'));
      return;
    }

    const result_ = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });

    if (!result_.canceled && result_.assets?.[0]) {
      const asset = result_.assets[0];
      setImageUri(asset.uri);
      setBase64Data(asset.base64 || null);
      setMimeType(asset.mimeType || 'image/jpeg');
      setResult(null);
      setError(null);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!base64Data) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    const steps = [
      'Analyzing waste',
      'Identifying category',
      'Finding correct dustbin',
    ];

    const timers: ReturnType<typeof setInterval>[] = [];
    steps.forEach((_, i) => {
      const t = setTimeout(() => setActiveStep(i + 1), (i + 1) * 1200);
      timers.push(t);
    });

    try {
      const res = await classifyWaste(base64Data, mimeType);
      setActiveStep(steps.length);
      await new Promise((r) => setTimeout(r, 400));
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Classification failed');
    } finally {
      setAnalyzing(false);
      timers.forEach(clearTimeout);
    }
  }, [base64Data, mimeType]);

  const dustbin = result?.isWaste ? getDustbinInfo(result.dustbinColor) : null;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color="#0F172A" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Smart Waste Scanner</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderEmptyState = () => (
    <>
      <View style={styles.infoCard}>
        <View style={styles.infoIconBox}>
          <Ionicons name="scan" size={28} color="#10B981" />
        </View>
        <Text style={styles.infoTitle}>Identify correct dustbin instantly</Text>
        <Text style={styles.infoSubtitle}>
          Take a photo or upload an image of your waste, and our AI will tell you exactly which bin to use.
        </Text>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => pickImage(true)}>
          <View style={[styles.optionIcon, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="camera" size={24} color="#10B981" />
          </View>
          <Text style={styles.optionLabel}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={() => pickImage(false)}>
          <View style={[styles.optionIcon, { backgroundColor: '#f5f3ff' }]}>
            <Ionicons name="images" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.optionLabel}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPreview = () => (
    <View style={styles.previewCard}>
      <Image source={{ uri: imageUri! }} style={styles.previewImage} resizeMode="cover" />
      <TouchableOpacity style={styles.removeBtn} onPress={reset}>
        <Ionicons name="close-circle" size={28} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderAnalyzing = () => (
    <View style={styles.loadingCard}>
      <View style={styles.loadingIconBox}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
      <Text style={styles.loadingTitle}>AI is analyzing your waste</Text>
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <LoadingStep icon="search" text="Analyzing waste" isActive={activeStep >= 1} />
        <LoadingStep icon="layers" text="Identifying category" isActive={activeStep >= 2} />
        <LoadingStep icon="trash" text="Finding correct dustbin" isActive={activeStep >= 3} />
      </View>
    </View>
  );

  const renderResult = () => {
    if (!result) return null;

    if (!result.isWaste) {
      return (
        <View style={styles.resultCard}>
          <View style={[styles.resultIconBox, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="help-circle" size={44} color="#EF4444" />
          </View>
          <Text style={styles.resultTitle}>Could not identify waste clearly</Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Tips for better results:</Text>
            {['Ensure good lighting', 'Get closer to the object', 'Show a single item'].map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons name="bulb" size={14} color="#F59E0B" />
                <Text style={{ marginLeft: 8, fontSize: 13, color: '#64748B' }}>{tip}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.scanAgainBtn} onPress={reset}>
            <Ionicons name="camera" size={18} color="white" />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.resultCard}>
        <View style={[styles.resultIconBox, { backgroundColor: '#ecfdf5' }]}>
          <Ionicons name="checkmark-circle" size={44} color="#10B981" />
        </View>
        <Text style={styles.resultTitle}>{result.wasteType}</Text>

        {dustbin && (
          <View style={[styles.dustbinBadge, { backgroundColor: dustbin.bg }]}>
            <Ionicons name={dustbin.icon} size={20} color={dustbin.color} />
            <Text style={[styles.dustbinLabel, { color: dustbin.color }]}>{dustbin.label}</Text>
          </View>
        )}

        <View style={styles.confidenceRow}>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: `${result.confidence || 0}%` }]} />
          </View>
          <Text style={styles.confidenceText}>{result.confidence}% accuracy</Text>
        </View>

        {result.tip && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={16} color="#F59E0B" />
            <Text style={styles.tipText}>{result.tip}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.scanAgainBtn} onPress={reset}>
          <Ionicons name="camera" size={18} color="white" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!imageUri && !analyzing && !result && !error && renderEmptyState()}
        {imageUri && !analyzing && !result && (
          <>
            {renderPreview()}
            <TouchableOpacity
              style={[styles.analyzeBtn, !base64Data && { opacity: 0.5 }]}
              onPress={handleAnalyze}
              disabled={!base64Data}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
              <Text style={styles.retakeBtnText}>Choose a different image</Text>
            </TouchableOpacity>
          </>
        )}
        {analyzing && renderAnalyzing()}
        {result && renderResult()}
        {error && !analyzing && (
          <View style={styles.resultCard}>
            <View style={[styles.resultIconBox, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="alert-circle" size={44} color="#EF4444" />
            </View>
            <Text style={styles.resultTitle}>Something went wrong</Text>
            <Text style={styles.resultMessage}>{error}</Text>
            <TouchableOpacity style={styles.scanAgainBtn} onPress={reset}>
              <Ionicons name="refresh" size={18} color="white" />
              <Text style={styles.scanAgainText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SmartWasteScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  infoIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1FAE5',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 280,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  analyzeBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  retakeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  loadingCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 24,
    alignItems: 'center',
  },
  loadingIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 24,
    alignItems: 'center',
  },
  resultIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  dustbinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  dustbinLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  confidenceRow: {
    width: '100%',
    marginTop: 20,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'right',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  tipsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  scanAgainBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    width: '100%',
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
});
