import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

const DiscoverScreen = () => {
  // Animation for shiny effect
  const shineAnim = new Animated.Value(0);
  const shakeAnim = new Animated.Value(0); // Animation for shake
  const [username, setUsername] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          setUsername('User');
        }
      } catch (error) {
        console.error('Error fetching username: ', error);
      }
    };

    fetchUsername();
  }, []);

  const startShineAnimation = () => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const startShakeAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startShineAnimation();
    startShakeAnimation();
  }, []);

  const shineInterpolation = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%'],
  });

  const getCardStyle = (level) => {
    switch (level) {
      case 'Elite':
        return { borderColor: '#FFD700', shadowColor: '#FFD700', gradientColors: ['#FFFFFF', '#FFD700', '#FFA500'] };
      case 'Premium':
        return { borderColor: '#C0C0C0', shadowColor: '#C0C0C0', gradientColors: ['#FFFFFF', '#FFFFFF', '#C0C0C0'] };
      case 'Standard':
        return { borderColor: '#CD7F32', shadowColor: '#CD7F32', gradientColors: ['#FFFFFF', '#FFFFFF', '#CD7F32'] };
      case 'Basic':
        return { borderColor: '#118B50', shadowColor: '#118B50', gradientColors: ['#FBF6E9', '#FBF6E9', '#118B50'] };
      default:
        return { borderColor: '#118B50', shadowColor: '#118B50', gradientColors: ['#118B50', '#FBF6E9', '#118B50'] };
    }
  };

  const renderCard = (level, title, description, offers, price, iconName, subButton) => {
    const { borderColor, shadowColor, gradientColors } = getCardStyle(level);
    const offersArray = offers.split('✔️').filter(offer => offer.trim() !== '');

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor, shadowColor }]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.shineOverlay,
              {
                transform: [{ translateX: shineInterpolation }],
              },
            ]}
          />
        </LinearGradient>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Icon name={iconName} size={24} color="#118B50" style={styles.cardIcon} />
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        <View style={styles.offersContainer}>
          {offersArray.map((offer, index) => (
            <View key={index} style={styles.offerItem}>
              <Icon name="checkmark-circle" size={20} color="#118B50" />
              <Text style={styles.cardOffer}>{offer.trim()}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardPrice}>{price}</Text>
        <TouchableOpacity
          style={styles.subButton}
          onPress={() => {
            setModalContent({ title, description, offersArray, price });
            setModalVisible(true);
          }}
        >
          <Text style={styles.subButtonText}>{subButton}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        <Text style={styles.greetings}>Hello {username}, you're currently on the Basic plan.</Text>
        <Text style={styles.subtitle}>Unlock more features and rewards by upgrading today!</Text>
        <Text style={styles.callToAction}>Join thousands of happy users who've upgraded to Standard, Premium, or Elite!</Text>

        {renderCard('Basic', 'Basic', 'Enjoy basic features with limited access.', '✔️ Free Daily Three Tasks. ✔️ Earn Upto KSH 10 Daily. ✔️ Tasks Expires After 24 Hours. ✔️ No Instant Withdrawals . ','Free', 'checkmark-circle','Subscribe Now')}
        {renderCard('Standard', 'Standard', 'Unlock more features and higher rewards.', '✔️ Enjoy Upto Fifteen Daily Tasks. ✔️ Earn Upto KSH 3,000 Daily. ✔️ Earn KSH 99 Per Video Watched. ✔️ Withdraw Earnings Instantly.', 'KSH 350', 'star-half','Subscribe Now')}
        {renderCard('Premium', 'Premium', 'Get premium features and even higher rewards.', '✔️ Enjoy Infinite Tasks. ✔️ Earn Upto KSH 5,000 Daily. ✔️ Refer a New User and Earn KSH 500. ✔️ Earn KSH 200 Per CAPTCHA Solved. ✔️ Withdraw Earnings Instantly.', 'KSH 700', 'star','Subscribe Now')}
        {renderCard('Elite', 'Elite', 'Access all features with the highest rewards.', '✔️ Perfom Virtual Assistant Tasks. ✔️ Earn KSH 999 Per Transcription Task. ✔️ Receive Support and Training. ✔️ Get Paid To Train New Users. ✔️ Create Team and Earn Commission.', 'KSH 1000', 'trophy','Subscribe Now')}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalDescription}>{modalContent.description}</Text>
            <View style={styles.modalOffersContainer}>
              {modalContent.offersArray && modalContent.offersArray.map((offer, index) => (
                <View key={index} style={styles.modalOfferItem}>
                  <Icon name="checkmark-circle" size={20} color="#118B50" />
                  <Text style={styles.modalOfferText}>{offer.trim()}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.modalPrice}>{modalContent.price}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FBF6E9',
    padding: 15,
  },
  greetings: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  callToAction: {
    fontSize: 13,
    marginBottom: 5,
    color: 'orange',
    fontFamily: 'Inter-Regular',
  },
  card: {
    padding: 15,
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    shadowColor: 'black',
    shadowOffset: { width: 5, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardIcon: {
    marginBottom: 10,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 5,
    color: '#118B50',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'start',
    marginBottom: 5,
    color: '#118B50',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
  },
  offersContainer: {
    marginBottom: 10,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 20,
  },
  cardOffer: {
    fontSize: 12,
    color: '#118B50',
    zIndex: 1,
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 12,
    color: 'orange',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    borderWidth: 1,
    maxWidth: '30%',
    marginBottom: 5,
    textAlign: 'center',
    borderColor: 'orange',
    borderRadius: 2,
    backgroundColor: 'white',
  },
  subButton: {
    textAlign: 'center',
    width: '100%',
    backgroundColor: 'orange',
    padding: 8,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  subButtonText: {
    color: 'green',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FBF6E9',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    height: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#118B50',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: '#118B50',
  },
  modalOffersContainer: {
    marginBottom: 10,
  },
  modalOfferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalOfferText: {
    fontSize: 12,
    color: '#118B50',
    marginLeft: 5,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'orange',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DiscoverScreen;