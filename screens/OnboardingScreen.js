import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const OnboardingScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation.navigate('SignUpScreen');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getContent = () => {
    switch (step) {
      case 1:
        return {
          image: require('../assets/images/stepOne.png'),
          title: 'Welcome to JibuCash Tasks',
          description: 'Turn your free time into real earnings. Let’s get started!',
        };
      case 2:
        return {
          image: require('../assets/images/stepTwo.png'),
          title: 'Unlock Your Earning Potential',
          description: 'Discover tips and tricks to maximize your income effortlessly!',
        };
      case 3:
        return {
          image: require('../assets/images/stepThree.png'),
          title: 'One Step Away!',
          description: 'Create your account now and start earning instantly!',
        };
      default:
        return {};
    }
  };

  const { image, title, description } = getContent();

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.radioContainer}>
        <View style={[styles.radio, step === 1 && styles.activeRadio]} />
        <View style={[styles.radio, step === 2 && styles.activeRadio]} />
        <View style={[styles.radio, step === 3 && styles.activeRadio]} />
      </View>
      <View style={styles.buttonContainer}>
        {step > 1 && step < 3 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={20} color="#FBF6E9" />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, step === 3 && styles.centerButton, step === 1 && styles.rightButton]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, step === 3 && styles.centerButtonText]}>
            {step < 3 ? 'Next' : 'Create Account'}
          </Text>
          {step < 3 && <Icon name="arrow-forward" size={20} color="#FBF6E9" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FBF6E9',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#118B50',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E3F0AF',
    marginHorizontal: 5,
  },
  activeRadio: {
    backgroundColor: '#118B50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerButton: {
    alignSelf: 'center',
    flex: 1,
    textAlign: 'center',
  },
  rightButton: {
    marginLeft: 'auto',
  },
  centerButtonText: {
    textAlign: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FBF6E9',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'Inter-Regular',
  },
});

export default OnboardingScreen;