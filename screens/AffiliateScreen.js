import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, ToastAndroid, Clipboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AffiliateScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const totalEarnings = 0; // in KSH
  const pendingPayouts = 0; // in KSH
  const referralCount = 0;

  // Empty referral history
  const referralHistory = [];

  // Function to generate a random referral code
  const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Function to save referral code to AsyncStorage
  const saveReferralCode = async (code) => {
    try {
      await AsyncStorage.setItem('referralCode', code);
      setReferralCode(code);
    } catch (error) {
      console.error('Error saving referral code:', error);
    }
  };

  // Function to fetch referral code from AsyncStorage
  const fetchReferralCode = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('referralCode');
      if (storedCode) {
        setReferralCode(storedCode);
      } else {
        const newCode = generateReferralCode();
        await saveReferralCode(newCode);
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  };

  // Fetch referral code when the component mounts
  useEffect(() => {
    fetchReferralCode();
  }, []);

  // Function to copy referral code to clipboard and show toast
  const handleCopyReferralCode = () => {
    Clipboard.setString(referralCode); // Copy to clipboard
    ToastAndroid.show('Referral code copied!', ToastAndroid.SHORT); // Show toast
  };

  // Function to handle sharing the referral link
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join me on this amazing app! Use my referral code: ${referralCode}. Download now: https://yourapplink.com`,
      });
      if (result.action === Share.sharedAction) {
        console.log('Share was successful');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Affiliate Program</Text>
        <Text style={styles.headerSubtitle}>Earn rewards by inviting friends</Text>
      </View>

      {/* Referral Code Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Referral Code</Text>
        <View style={styles.referralCodeContainer}>
          <Text style={styles.referralCode}>{referralCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferralCode}>
            <Icon name="copy-outline" size={20} color="#5DB996" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>
      </View>

      {/* Earnings Overview Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Earnings Overview</Text>
        <View style={styles.earningsContainer}>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Total Earnings</Text>
            <Text style={styles.earningValue}>KSH {totalEarnings}</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Pending Payouts</Text>
            <Text style={styles.earningValue}>KSH {pendingPayouts}</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Referrals</Text>
            <Text style={styles.earningValue}>{referralCount}</Text>
          </View>
        </View>
      </View>

      {/* Referral History Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Referral History</Text>
        {referralHistory.length > 0 ? (
          referralHistory.map((item) => (
            <View key={item.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>{item.name}</Text>
                <Text style={styles.referralDate}>{item.date}</Text>
              </View>
              <Text style={styles.referralEarnings}>+KSH {item.earnings}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={50} color="#5DB996" />
            <Text style={styles.emptyStateText}>No referrals yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start sharing your referral link to invite friends and earn rewards!
            </Text>
          </View>
        )}
      </View>

      {/* Call-to-Action Section */}
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>Invite more friends and earn more rewards!</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleShare}>
          <Text style={styles.ctaButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6E9',
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 15,
    fontFamily: 'Inter-Bold',
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  referralCode: {
    fontSize: 16,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
  },
  copyButton: {
    padding: 5,
  },
  shareButton: {
    backgroundColor: '#5DB996',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningItem: {
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 14,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  referralDate: {
    fontSize: 12,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
  },
  referralEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
    marginTop: 10,
    fontFamily: 'Inter-Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#5DB996',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  ctaContainer: {
    backgroundColor: '#5DB996',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

export default AffiliateScreen;