import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [showSuccessGif, setShowSuccessGif] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      if (validateEmail(email)) {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUsername(userDoc.username);
          await AsyncStorage.setItem('username', userDoc.username);
        } else {
          setUsername('');
        }
      } else {
        setUsername('');
      }
    };

    fetchUsername();
  }, [email]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignIn = async () => {
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
          }, 2500); // Display the GIF for 2 seconds
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
    <View style={styles.container}>
      <Image source={require('../assets/images/welcomeback.png')} style={styles.image} />
      <Text style={styles.title}>Welcome back to JibuCash Tasks {username}</Text>
      <Text style={styles.content}>Continue doing tasks and get paid instantly. Please sign in to continue.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#118B50" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        {loading ? (
          <ActivityIndicator size="small" color="#FBF6E9" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FBF6E9',
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
});

export default SignInScreen;