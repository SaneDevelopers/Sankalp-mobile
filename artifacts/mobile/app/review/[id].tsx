import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
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

import { BOOKINGS } from '@/constants/data';
import { PANDIT_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';

const TAGS = ['Knowledgeable', 'Punctual', 'Respectful', 'Clear Pronunciation', 'Well Prepared', 'Calming Presence'];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const booking = BOOKINGS.find(b => b.id === id) ?? BOOKINGS[1];
  const panditImgId = booking.panditInitials === 'VS' ? '1' : booking.panditInitials === 'KN' ? '2' : booking.panditInitials === 'RJ' ? '3' : '4';

  const STAR_LABELS = ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Rate & Review</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
          {/* Pandit Card */}
          <View style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={PANDIT_IMAGES[panditImgId]} style={styles.panditPhoto} resizeMode="cover" />
            <View style={styles.panditInfo}>
              <Text style={[styles.panditName, { color: colors.text }]}>{booking.panditName}</Text>
              <Text style={[styles.poojaName, { color: colors.mutedForeground }]}>{booking.poojaName}</Text>
              <Text style={[styles.bookingDate, { color: colors.mutedForeground }]}>{booking.date} · {booking.time}</Text>
            </View>
          </View>

          {/* Stars */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRating(star);
                }}
              >
                <Feather
                  name="star"
                  size={44}
                  color={(hovered || rating) >= star ? colors.gold : colors.border}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.starLabel, { color: colors.gold }]}>{STAR_LABELS[rating]}</Text>
          )}

          {/* Tags */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What stood out?</Text>
          <View style={styles.tagsWrap}>
            {TAGS.map(tag => {
              const selected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: selected ? colors.primary + '15' : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  {selected && <Feather name="check" size={12} color={colors.primary} />}
                  <Text style={[styles.tagText, { color: selected ? colors.primary : colors.text }]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Written Review */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Write a Review</Text>
          <TextInput
            style={[styles.reviewInput, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: 'Inter_400Regular',
            }]}
            placeholder="Share your experience with this pandit... How was the ritual? Was he well prepared?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.submitBtn, { backgroundColor: rating > 0 ? colors.primary : colors.border }]}
          disabled={rating === 0}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }}
        >
          <Feather name="send" size={18} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Submit Review</Text>
        </Pressable>
      </View>
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
  body: { padding: 20, gap: 16 },
  panditCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: 14, borderWidth: 1,
  },
  panditPhoto: { width: 56, height: 56, borderRadius: 28 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  poojaName: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2 },
  bookingDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 4 },
  starLabel: { textAlign: 'center', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5,
  },
  tagText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  reviewInput: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    fontSize: 14, minHeight: 130, lineHeight: 22,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, gap: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 },
});
