import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('Arnav Sharma');
  const [phone, setPhone] = useState('+91 98XXX XXX12');
  const [email, setEmail] = useState('arnav.sharma@gmail.com');
  const [city, setCity] = useState('Delhi NCR');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const fields = [
    { label: 'FULL NAME', icon: 'user', value: name, setter: setName, keyboard: 'default' as const },
    { label: 'PHONE NUMBER', icon: 'phone', value: phone, setter: setPhone, keyboard: 'phone-pad' as const },
    { label: 'EMAIL ADDRESS', icon: 'mail', value: email, setter: setEmail, keyboard: 'email-address' as const },
    { label: 'CITY', icon: 'map-pin', value: city, setter: setCity, keyboard: 'default' as const },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.inner, { paddingBottom: bottomPadding + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: colors.gold }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <Pressable style={[styles.cameraBtn, { backgroundColor: colors.orange }]}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={[styles.changePhotoText, { color: colors.accent }]}>Tap to change photo</Text>
        </View>

        {/* Fields */}
        {fields.map(f => (
          <View key={f.label} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{f.label}</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={f.icon as any} size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
                value={f.value}
                onChangeText={f.setter}
                keyboardType={f.keyboard}
              />
            </View>
          </View>
        ))}

        {/* Devotee ID (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>DEVOTEE ID</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <Text style={[styles.readOnlyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              SKL-D-40291
            </Text>
            <View style={[styles.lockedBadge, { backgroundColor: colors.border }]}>
              <Feather name="lock" size={10} color={colors.mutedForeground} />
            </View>
          </View>
        </View>

        {/* Save */}
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  inner: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 32 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  changePhotoText: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 8 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  readOnlyText: { flex: 1, fontSize: 15 },
  lockedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 17, gap: 10, marginTop: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1 },
});
