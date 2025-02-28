import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // New state for connectivity

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please turn on your internet to sign up.',
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const checkEmailExists = async (email) => {
    if (!isOnline) return false; // Skip check if offline
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignUp = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please turn on your internet to sign up.');
      return;
    }

    let valid = true;
    let errors = {};

    if (!username) {
      errors.username = 'Username is required';
      valid = false;
    }

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Email is not valid';
      valid = false;
    } else if (await checkEmailExists(email)) {
      errors.email = 'User already exists';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
      valid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(errors);

    if (valid) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'users'), {
          username,
          email,
          password,
        });
        setLoading(false);
        Alert.alert(
          'Success',
          'Account created successfully',
          [
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('SignInScreen'),
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', 'An error occurred while creating the account');
      }
    }
  };

  const handleGoogleSignUp = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please turn on your internet to sign up with Google.');
      return;
    }
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      Alert.alert('Error!', 'An error occurred. Try signing up manually. Fill form to continue.');
    }, 3000);
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
        <Image source={require('../assets/images/createAcc.png')} style={styles.image} />
        <Text style={styles.title}>Create JibuCash Tasks Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          editable={isOnline} // Disable input when offline
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={isOnline} // Disable input when offline
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={!isOnline}>
            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={isOnline ? "#118B50" : "#A9A9A9"} />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        <TouchableOpacity
          style={[styles.button, !isOnline && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={!isOnline}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FBF6E9" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.googleButton, !isOnline && styles.disabledButton]}
          onPress={handleGoogleSignUp}
          disabled={!isOnline}
        >
          {googleLoading ? (
            <ActivityIndicator size={20} color="#118B50" />
          ) : (
            <>
              <Icon name="logo-google" size={20} color={isOnline ? "#118B50" : "#A9A9A9"} />
              <Text style={[styles.googleButtonText, !isOnline && styles.disabledText]}>Sign Up with Google</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')} disabled={!isOnline}>
          <Text style={[styles.signInText, !isOnline && styles.disabledText]}>Already have an account? Sign In</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FBF6E9',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
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
    marginVertical: 5,
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F0AF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#118B50',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginLeft: 10,
  },
  signInText: {
    color: '#118B50',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 20,
  },
  image: {
    width: 170,
    height: 170,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
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

export default SignUpScreen;