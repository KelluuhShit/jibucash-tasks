import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

const DiscoverScreen = () => {
  // Animation for shiny effect
  const shineAnim = new Animated.Value(0);
  const [username, setUsername] = useState('');
  

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

  React.useEffect(() => {
    startShineAnimation();
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

  const renderCard = (level, title, description, price, iconName) => {
    const { borderColor, shadowColor, gradientColors } = getCardStyle(level);

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
        <View style={styles.cardHeader} >
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon name={iconName} size={24} color="#118B50" style={styles.cardIcon} />
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        <Text style={styles.cardPrice}>{price}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.cardContainer}>
      <Text style={styles.greetings}>Hello {username}, you're currently on the Basic plan.</Text>
      <Text style={styles.subtitle}>Unlock more features and rewards by upgrading today!</Text>
      <Text style={styles.callToAction}>Join thousands of happy users who've upgraded to Standard, Premium, or Elite!</Text>

      {renderCard('Basic', 'Basic', 'Enjoy basic features with limited access.', 'Free', 'checkmark-circle')}
      {renderCard('Standard', 'Standard', 'Unlock more features and higher rewards.', 'KSH 350', 'star-half')}
      {renderCard('Premium', 'Premium', 'Get premium features and even higher rewards.', 'KSH 700', 'star')}
      {renderCard('Elite', 'Elite', 'Access all features with the highest rewards.', 'KSH 1000', 'trophy')}
    </ScrollView>
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
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
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
    marginBottom: 10,
    color: '#118B50',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'start',
    marginBottom: 10,
    color: '#118B50',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
  },
  cardPrice: {
    fontSize: 12,
    color: 'orange',
    zIndex: 1,
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
  },
});

export default DiscoverScreen;