import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [showSuccessGif, setShowSuccessGif] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // New state for connectivity

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please turn on your internet to sign in.',
          [{ text: 'OK', onPress: () => console.log('User acknowledged offline status') }]
        );
      }
    });

    // Initial fetch of connectivity
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!isOnline) return; // Skip fetch if offline
      if (validateEmail(email)) {
        const q = query(collection(db, 'users'), where('email', '==', email));
        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUsername(userDoc.username);
            await AsyncStorage.setItem('username', userDoc.username);
          } else {
            setUsername('');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      } else {
        setUsername('');
      }
    };

    fetchUsername();
  }, [email, isOnline]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignIn = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please turn on your internet to sign in.');
      return;
    }

    let valid = true;
    let errors = {};

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Email is not valid';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    }

    setErrors(errors);

    if (valid) {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('email', '==', email), where('password', '==', password));
        const querySnapshot = await getDocs(q);
        setLoading(false);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUsername(userDoc.username);
          setShowSuccessGif(true);
          setTimeout(() => {
            setShowSuccessGif(false);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
              })
            );
          }, 2500);
        } else {
          Alert.alert('Error', 'Invalid email or password');
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', 'An error occurred while signing in');
      }
    }
  };

  return (
    <ScrollView style={styles.home}>
      <View style={styles.container}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Image
              source={require('../assets/images/offline.png')} // Adjust path as needed
              style={styles.offlineImage}
            />
            <Text style={styles.offlineText}>You are offline. Please turn on your internet.</Text>
          </View>
        )}
        <Image source={require('../assets/images/welcomeback.png')} style={styles.image} />
        <Text style={styles.title}>Welcome back to JibuCash Tasks {username}</Text>
        <Text style={styles.content}>Continue doing tasks and get paid instantly. Please sign in to continue.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={isOnline} // Disable input when offline
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={isOnline} // Disable input when offline
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} disabled={!isOnline}>
            <Icon name={showPassword ? "eye-off" : "eye"} size={20} color={isOnline ? "#118B50" : "#A9A9A9"} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        <TouchableOpacity
          style={[styles.button, !isOnline && styles.disabledButton]}
          onPress={handleSignIn}
          disabled={!isOnline}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FBF6E9" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')} disabled={!isOnline}>
          <Text style={[styles.signUpText, !isOnline && styles.disabledText]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
        <Modal visible={showSuccessGif} transparent={true} animationType="fade">
          <View style={styles.animationContainer}>
            <Image
              source={require('../assets/images/successSignin.gif')}
              style={styles.gif}
            />
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  home: {
    flex: 1,
    backgroundColor: '#FBF6E9',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FBF6E9',
    minHeight:'100%'
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#118B50',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    borderRadius: 2,
    backgroundColor: '#fff',
    fontFamily: 'Inter-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    fontFamily: 'Inter-Regular',
    fontSize: 10,
  },
  button: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#FBF6E9',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  signUpText: {
    color: '#118B50',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 20,
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gif: {
    width: 200,
    height: 200,
  },
  offlineBanner: {
    backgroundColor: '#FF6347',
    padding: 5,
    flexDirection: 'row', // Align image and text horizontally
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineImage: {
    width: 50, // Adjust size as needed
    height: 50,
    marginRight: 5, // Space between image and text
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

export default SignInScreen;