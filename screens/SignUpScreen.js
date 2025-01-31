import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const checkEmailExists = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignUp = async () => {
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
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      Alert.alert('Error!', 'An error occurred. Try signing up manually. Fill form to continue.');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create JibuCash Tasks Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#118B50" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        {loading ? (
          <ActivityIndicator size="small" color="#FBF6E9" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
        {googleLoading ? (
          <ActivityIndicator size={20} color="#118B50" />
        ) : (
          <>
            <Icon name="logo-google" size={20} color="#118B50" />
            <Text style={styles.googleButtonText}>Sign Up with Google</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    borderRadius: 5,
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
    borderRadius: 5,
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
});

export default SignUpScreen;