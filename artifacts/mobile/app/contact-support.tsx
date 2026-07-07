import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  useAuthMe,
  useGetBookings,
  getGetBookingsQueryKey,
  useGetOrders,
  getGetOrdersQueryKey,
} from '@workspace/api-client-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

interface Suggestion {
  label: string;
  text: string;
}

export default function ContactSupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, f } = useLanguage();
  const scrollViewRef = useRef<ScrollView>(null);

  const [chatLanguage, setChatLanguage] = useState<'en' | 'hi' | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch active user database information
  const { data: user } = useAuthMe();
  const { data: bookings = [] } = useGetBookings({
    query: {
      enabled: !!user,
      queryKey: getGetBookingsQueryKey(),
    },
  });
  const { data: orders = [] } = useGetOrders({
    query: {
      enabled: !!user,
      queryKey: getGetOrdersQueryKey(),
    },
  });

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = insets.bottom || 16;

  // Auto scroll to bottom
  useEffect(() => {
    if (chatLanguage) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping, chatLanguage]);

  // Set initial greeting after language selection
  const handleSelectLanguage = (lang: 'en' | 'hi') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChatLanguage(lang);

    const greetingText = lang === 'en'
      ? 'Namaste! Welcome to Sankalp support. How can we assist you with your rituals, orders, or bookings today? 🌸'
      : 'नमस्ते! संकल्प सहायता में आपका स्वागत है। आज हम आपके अनुष्ठान, ऑर्डर या बुकिंग में आपकी क्या सहायता कर सकते हैं? 🌸';

    setMessages([
      {
        id: '1',
        text: greetingText,
        sender: 'support',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const getSuggestions = (): Suggestion[] => {
    if (chatLanguage === 'en') {
      return [
        { label: '📅 Booking Status', text: 'I want to check my booking status' },
        { label: '💳 Payment & Refund', text: 'I have a question about payment or refund' },
        { label: '🌿 Pandit Details', text: 'How are the Pandits verified?' },
        { label: '📦 Samagri Order', text: 'Where is my pooja samagri kit?' },
      ];
    } else {
      return [
        { label: '📅 बुकिंग स्थिति', text: 'मैं अपनी बुकिंग की स्थिति जानना चाहता हूँ' },
        { label: '💳 भुगतान और रिफंड', text: 'मुझे भुगतान या रिफंड के बारे में पूछना है' },
        { label: '🌿 पंडित की जानकारी', text: 'पंडितों का सत्यापन कैसे होता है?' },
        { label: '📦 सामग्री ऑर्डर', text: 'मेरी पूजा सामग्री किट कहाँ है?' },
      ];
    }
  };

  const getAutoReply = (userMsg: string): string => {
    const text = userMsg.toLowerCase();
    const isEn = chatLanguage === 'en';

    // 1. BOOKING STATUS CHECK
    if (text.includes('booking') || text.includes('book') || text.includes('बुकिंग')) {
      if (bookings.length > 0) {
        const latestBooking = bookings[0];
        const statusMap: Record<string, string> = {
          upcoming: isEn ? 'Upcoming (Scheduled)' : 'आगामी (निर्धारित)',
          completed: isEn ? 'Completed' : 'पूर्ण',
          cancelled: isEn ? 'Cancelled' : 'रद्द',
        };
        const displayStatus = statusMap[latestBooking.status] || latestBooking.status;
        return isEn
          ? `I found an active booking for you! Your "${latestBooking.poojaName}" with Pandit ${latestBooking.panditName} is scheduled on ${latestBooking.date} at ${latestBooking.time}. Current Status: ${displayStatus}. 🌸`
          : `मुझे आपकी एक बुकिंग मिली है! पंडित ${latestBooking.panditName} जी के साथ आपका "${latestBooking.poojaName}" अनुष्ठान ${latestBooking.date} को ${latestBooking.time} बजे निर्धारित है। वर्तमान स्थिति: ${displayStatus} है। 🌸`;
      } else {
        return isEn
          ? "I checked our system, but there are no bookings registered under your account. You can book a ritual easily from the Home screen! 🌸"
          : "मैंने सिस्टम में जांच की है, लेकिन आपके खाते के अंतर्गत कोई बुकिंग दर्ज नहीं है। आप होम स्क्रीन से आसानी से पूजा बुक कर सकते हैं! 🌸";
      }
    }

    // 2. PAYMENT & REFUND CHECK
    if (text.includes('refund') || text.includes('payment') || text.includes('pay') || text.includes('रिफंड') || text.includes('भुगतान')) {
      if (bookings.length > 0 || orders.length > 0) {
        const latestBooking = bookings[0];
        const latestOrder = orders[0];
        const amount = latestBooking ? latestBooking.amount : (latestOrder ? latestOrder.amount : 0);
        const refId = latestBooking ? latestBooking.bookingId : (latestOrder ? latestOrder.orderId : 'N/A');

        return isEn
          ? `Your latest payment of ₹${amount.toLocaleString('en-IN')} for transaction ID ${refId} was processed successfully via Razorpay. If this was cancelled, refunds will reach your source account within 3-5 business days. 💳`
          : `आईडी ${refId} के लिए आपका ₹${amount.toLocaleString('en-IN')} का अंतिम भुगतान रेज़रपे के माध्यम से सफलतापूर्वक संसाधित हुआ था। यदि यह रद्द कर दिया गया था, तो रिफंड 3-5 कार्य दिवसों में आपके मूल खाते में पहुंच जाएगा। 💳`;
      } else {
        return isEn
          ? "No transaction history was found on your account. All payments on Sankalp are fully secure and processed safely via Razorpay. 💳"
          : "आपके खाते में कोई लेन-देन इतिहास नहीं मिला। संकल्प पर सभी भुगतान पूरी तरह से सुरक्षित हैं और रेज़रपे के माध्यम से सुरक्षित रूप से किए जाते हैं। 💳";
      }
    }

    // 3. PANDIT DETAILS VETTING CHECK
    if (text.includes('pandit') || text.includes('pundit') || text.includes('पंडित')) {
      const activeBooking = bookings.find(b => b.status === 'upcoming');
      if (activeBooking) {
        return isEn
          ? `Yes, Pandit ${activeBooking.panditName} is assigned to your upcoming ritual on ${activeBooking.date}. You can find their reviews and rating credentials on their Pandit Profile card! 🌿`
          : `जी हाँ, पंडित ${activeBooking.panditName} जी को ${activeBooking.date} को होने वाले आपके आगामी अनुष्ठान के लिए आवंटित किया गया है। आप उनकी रेटिंग और प्रमाणपत्र विवरण उनकी प्रोफ़ाइल पर देख सकते हैं। 🌿`;
      } else {
        return isEn
          ? "All Pandits listed on Sankalp are certified Vedic Acharyas and Shastri scholars. They go through a strict 3-step credential verification. 🌿"
          : "संकल्प पर सूचीबद्ध सभी पंडित जी प्रमाणित वैदिक आचार्य और शास्त्री विद्वान हैं। वे योग्यता और अनुभव के 3-चरणीय कठोर सत्यापन से गुजरते हैं। 🌿";
      }
    }

    // 4. SAMAGRI ORDER STATUS CHECK
    if (text.includes('order') || text.includes('samagri') || text.includes('सामग्री')) {
      if (orders.length > 0) {
        const latestOrder = orders[0];
        const statusMap: Record<string, string> = {
          processing: isEn ? 'Processing' : 'तैयार किया जा रहा है',
          in_transit: isEn ? 'In Transit (Shipped)' : 'रास्ते में है',
          delivered: isEn ? 'Delivered' : 'वितरित हो चुका है',
          cancelled: isEn ? 'Cancelled' : 'रद्द',
        };
        const displayStatus = statusMap[latestOrder.status] || latestOrder.status;
        const items = latestOrder.items as Array<{ name: string; qty: number }> || [];
        const itemNames = items.map(i => `${i.name} (x${i.qty})`).join(', ');

        return isEn
          ? `Your order ${latestOrder.orderId} for: ${itemNames} is currently "${displayStatus}". Standard express delivery brings kits 24 hours prior to ritual. 📦`
          : `आपका ऑर्डर ${latestOrder.orderId} (सामग्री: ${itemNames}) वर्तमान में "${displayStatus}" की स्थिति में है। सामग्री किट अनुष्ठान से 24 घंटे पहले वितरित की जाती है। 📦`;
      } else {
        return isEn
          ? "No samagri orders found on your account. You can buy complete pooja samagri kits and brass utensils from the Samagri Store tab! 📦"
          : "आपके खाते में कोई सामग्री ऑर्डर नहीं मिला। आप सामग्री स्टोर टैब से सम्पूर्ण पूजा सामग्री किट और तांबे-पीतल के बर्तन खरीद सकते हैं! 📦";
      }
    }

    return isEn
      ? "Thank you for reaching out. We have logged your query. Our support coordinator will connect with you shortly on your registered contact number. Have a blessed day! 🙏"
      : "हमसे संपर्क करने के लिए धन्यवाद। आपका प्रश्न दर्ज कर लिया गया है। हमारे प्रतिनिधि जल्द ही आपके पंजीकृत नंबर पर आपसे संपर्क करेंगे। आपका दिन शुभ हो! 🙏";
  };

  const handleSendText = (text: string) => {
    if (!text.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Math.random().toString(),
      text: text.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');

    // Trigger typing response
    setIsTyping(true);
    setTimeout(() => {
      const replyText = getAutoReply(userMessage.text);
      const supportMessage: Message = {
        id: Math.random().toString(),
        text: replyText,
        sender: 'support',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.primary, fontFamily: f('bold') }]}>
            {chatLanguage === 'hi' ? 'सहायता चैट' : 'Support Chat'}
          </Text>
          {chatLanguage && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={[styles.statusText, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                {chatLanguage === 'hi' ? 'ऑटो-रिप्लाई सक्रिय' : 'Auto-Reply active'}
              </Text>
            </View>
          )}
        </View>
        {chatLanguage ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setChatLanguage(null);
              setMessages([]);
            }}
            style={styles.langSwitchBtn}
          >
            <Feather name="globe" size={16} color={colors.primary} />
            <Text style={[styles.langSwitchText, { color: colors.primary, fontFamily: f('medium') }]}>
              {chatLanguage === 'hi' ? 'EN' : 'हिंदी'}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Language Selector Overlay */}
      {!chatLanguage ? (
        <View style={[styles.langOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.langCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.langIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="message-square" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.langTitle, { color: colors.text, fontFamily: f('bold') }]}>
              Select Support Language
            </Text>
            <Text style={[styles.langSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              सहायता चैट शुरू करने के लिए भाषा चुनें
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.langBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={() => handleSelectLanguage('en')}
            >
              <Text style={[styles.langBtnText, { fontFamily: f('bold') }]}>English</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.langBtn,
                { backgroundColor: colors.gold, marginTop: 12, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={() => handleSelectLanguage('hi')}
            >
              <Text style={[styles.langBtnText, { fontFamily: f('bold') }]}>हिंदी (Hindi)</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.supportRow,
                  ]}
                >
                  {!isUser && (
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.avatarText, { color: colors.primary, fontFamily: f('bold') }]}>ॐ</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: colors.primary }]
                        : [styles.supportBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                    ]}
                  >
                    <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : colors.text, fontFamily: f('regular') }]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.mutedForeground, fontFamily: f('regular') }]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.messageRow, styles.supportRow]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.avatarText, { color: colors.primary, fontFamily: f('bold') }]}>ॐ</Text>
                </View>
                <View style={[styles.bubble, styles.supportBubble, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.typingText, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
                    {chatLanguage === 'hi' ? 'पंडित सहायक टाइप कर रहे हैं...' : 'Support is writing...'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggestions Quick Replies */}
          <View style={styles.suggestionsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {getSuggestions().map((s, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.suggestionPill, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleSendText(s.text)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text, fontFamily: f('medium') }]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View
            style={[
              styles.inputBar,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.card,
                paddingBottom: bottomPadding,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontFamily: f('regular') }]}
              placeholder={chatLanguage === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Type your query here...'}
              placeholderTextColor={colors.mutedForeground}
              value={inputVal}
              onChangeText={setInputVal}
              onSubmitEditing={() => handleSendText(inputVal)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => handleSendText(inputVal)}
              disabled={!inputVal.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: inputVal.trim() ? colors.primary : colors.mutedForeground + '30' },
              ]}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11 },
  langSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langSwitchText: { fontSize: 12 },

  // Lang Selection CSS
  langOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  langCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  langIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  langTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  langSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  langBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  langBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Chat CSS
  chatArea: { flex: 1 },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  supportRow: { alignSelf: 'flex-start', gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  avatarText: { fontSize: 14 },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    flexShrink: 1,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  supportBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  typingText: { fontSize: 13 },

  // Suggestions CSS
  suggestionsContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  suggestionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
  },

  // Input CSS
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
