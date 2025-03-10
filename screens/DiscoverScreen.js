import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Modal, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const DiscoverScreen = ({ navigation }) => {
  const shineAnim = new Animated.Value(0);
  const shakeAnim = new Animated.Value(0);
  const [username, setUsername] = useState('');
  const [subscription, setSubscription] = useState('Basic'); // New state to track subscription
  const [modalVisible, setModalVisible] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [mpesaErrorMessage, setMpesaErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername || 'User');
        const storedSubscription = await AsyncStorage.getItem('subscription');
        setSubscription(storedSubscription || 'Basic');
        console.log('Current subscription:', storedSubscription || 'Basic');
      } catch (error) {
        console.error('Error fetching user data: ', error);
        setUsername('Guest');
        setSubscription('Basic');
      }
    };
    fetchUserData();
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
    const isSubscribed = subscription === title; // Check if this plan is the current subscription

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor, shadowColor }]}
        activeOpacity={0.8}
        disabled={level === 'Basic'}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[styles.shineOverlay, { transform: [{ translateX: shineInterpolation }] }]}
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
        {level !== 'Basic' && (
          <TouchableOpacity
            style={[styles.subButton, isSubscribed && styles.subscribedButton]} // Change style if subscribed
            onPress={() => {
              if (!isSubscribed) { // Only allow action if not subscribed
                const priceValue = parseFloat(price.replace('KSH ', ''));
                setModalContent({ title, description, offersArray, price: priceValue, iconName });
                setModalVisible(true);
              }
            }}
            disabled={isSubscribed} // Disable button if subscribed
          >
            <Text style={styles.subButtonText}>{isSubscribed ? 'Subscribed' : subButton}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const validatePhoneNumber = () => {
    if (phoneNumber.length < 10) {
      setErrorMessage('Phone number must be at least 10 digits');
    } else {
      setErrorMessage('Processing...');
      setTimeout(() => {
        Alert.alert(
          'Error',
          'Error initiating payment',
          [{ text: 'Proceed Manually', onPress: () => setManualModalVisible(true) }],
          { cancelable: false }
        );
        setErrorMessage('');
      }, 3000);
    }
  };

  const validateMpesaMessage = async () => {
    const priceInteger = parseInt(modalContent.price, 10);
    if (!modalContent.price || isNaN(priceInteger)) {
      setMpesaErrorMessage('Invalid price value');
      return;
    }
    const priceString = Number.isInteger(Number(modalContent.price)) ? priceInteger.toString() : `${priceInteger}.00`;

    if (!mpesaMessage) {
      setMpesaErrorMessage('Please paste the MPESA message to continue');
    } else if (!mpesaMessage.includes(priceString) || !mpesaMessage.includes('paid to FANAKA SOLUTIONS')) {
      setMpesaErrorMessage('Please make the payment and try again');
    } else {
      try {
        const paymentData = {
          username,
          amount: priceInteger,
          timestamp: Date.now(),
          mpesaMessage,
          phoneNumber,
          subscriptionPlan: modalContent.title,
        };
        await addDoc(collection(db, 'payments'), paymentData);
        console.log('Payment saved to Firestore:', paymentData);

        // Update AsyncStorage with the new subscription
        await AsyncStorage.setItem('subscription', modalContent.title);
        console.log('Subscription updated in AsyncStorage:', modalContent.title);

        setMpesaErrorMessage('');
        setSuccessModalVisible(true);
        setManualModalVisible(false);
        setModalVisible(false);

        // Navigate back to HomeScreen
        navigation.navigate('Home');
      } catch (error) {
        console.error('Error saving payment or subscription:', error);
        setMpesaErrorMessage('Failed to save payment. Please try again.');
      }
    }
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
    // Update subscription state when closing success modal
    AsyncStorage.getItem('subscription').then(storedSubscription => {
      setSubscription(storedSubscription || 'Basic');
    }).catch(error => {
      console.error('Error fetching subscription on modal close:', error);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        <Text style={styles.greetings}>Hello {username}, you're currently on the {subscription} plan.</Text>
        <Text style={styles.subtitle}>Unlock more features and rewards by upgrading today!</Text>
        <Text style={styles.callToAction}>Join thousands of happy users who've upgraded to Standard, Premium, or Elite!</Text>

        {renderCard('Basic', 'Basic', 'Enjoy basic features with limited access.', '✔️ Free Daily Three Tasks. ✔️ Earn Upto KSH 10 Daily. ✔️ Tasks Expires After 24 Hours. ✔️ No Instant Withdrawals . ', 'Free', 'checkmark-circle', 'Subscribed')}
        {renderCard('Standard', 'Standard', 'Unlock more features and higher rewards.', '✔️ Enjoy Upto Fifteen Daily Tasks. ✔️ Earn Upto KSH 3,000 Daily. ✔️ Earn KSH 99 Per Video Watched. ✔️ Withdraw Earnings Instantly.', 'KSH 150', 'star-half', 'Subscribe Now')}
        {renderCard('Premium', 'Premium', 'Get premium features and even higher rewards.', '✔️ Enjoy Infinite Tasks. ✔️ Earn Upto KSH 5,000 Daily. ✔️ Refer a New User and Earn KSH 500. ✔️ Earn KSH 200 Per CAPTCHA Solved. ✔️ Withdraw Earnings Instantly.', 'KSH 200', 'star', 'Subscribe Now')}
        {renderCard('Elite', 'Elite', 'Access all features with the highest rewards.', '✔️ Perform Virtual Assistant Tasks. ✔️ Earn KSH 999 Per Transcription Task. ✔️ Receive Support and Training. ✔️ Get Paid To Train New Users. ✔️ Create Team and Earn Commission.', 'KSH 250', 'trophy', 'Subscribe Now')}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.modalIcon}>
                <Icon name={modalContent.iconName} size={100} color="orange" style={styles.cardIcon} />
              </View>
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
              <Text style={styles.modalPrice}>KSH {modalContent.price}</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={text => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
              />
              {errorMessage ? <Text style={[styles.errorText, errorMessage === 'Processing...' && styles.processingText]}>{errorMessage}</Text> : null}
              <TouchableOpacity style={styles.initiateButton} onPress={validatePhoneNumber}>
                <Text style={styles.initButtonText}>Initiate Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={manualModalVisible}
        onRequestClose={() => setManualModalVisible(!manualModalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.tillContainer}>
                <Image source={require('../assets/images/tillNumber.png')} style={styles.tillNumberImage} />
              </View>
              <Text style={styles.modalManualPrice}>To Process and Complete your Subscription, Pay KSH {modalContent.price} to FANAKA SOLUTIONS and Paste Your Message Below and Click Confirm Payment</Text>
              <TextInput
                style={styles.pasteInput}
                placeholder="Paste your MPESA message here..."
                value={mpesaMessage}
                onChangeText={setMpesaMessage}
                multiline
              />
              {mpesaErrorMessage ? <Text style={styles.errorText}>{mpesaErrorMessage}</Text> : null}
              <TouchableOpacity style={styles.initiateButton} onPress={validateMpesaMessage}>
                <Text style={styles.initButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setManualModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.successModalContainer}>
          <LinearGradient
            colors={['#5DB996', '#118B50']}
            style={styles.successModalContent}
          >
            <Icon name="checkmark-circle" size={60} color="#FBF6E9" style={styles.successIcon} />
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>Your payment of KSH {modalContent.price} has been confirmed.</Text>
            <TouchableOpacity style={styles.successButton} onPress={closeSuccessModal}>
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    borderRadius: 10,
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
  subscribedButton: {
    backgroundColor: '#A9A9A9', // Grey out when subscribed
  },
  subButton: {
    backgroundColor: '#5DB996',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  subButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width:'100%'
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FBF6E9',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    height: '100%',
  },
  modalScrollContainer:{
    justifyContent: 'center',
    width:'100%',
    height:'100%',
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#118B50',
    textAlign: 'center',
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
  phoneInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    borderRadius: 5,
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  pasteInput:{
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    borderRadius: 5,
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
    height: 100,
    textAlignVertical: 'top',
    overflow: 'hidden',
    multiline: true,
    scrollEnabled: false,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  processingText: {
    color: 'green',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: 'white',
    width:'100%',
  },
  closeButtonText: {
    color: 'green',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  initiateButton: {
    backgroundColor: '#5DB996',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width:'100%',
  },
  initButtonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter-Regular',
  },
  tillContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tillNumberImage: {
    width: 250,
    height: 180,
    marginBottom: 20,
  },
  modalManualPrice:{
    marginBottom: 20,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },

  successModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successModalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FBF6E9',
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  successMessage: {
    fontSize: 16,
    color: '#FBF6E9',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  successButton: {
    backgroundColor: '#FBF6E9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  successButtonText: {
    color: '#5DB996',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Regular',
  },
 
});

export default DiscoverScreen;