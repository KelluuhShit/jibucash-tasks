import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const WalletScreen = () => {
  const [username, setUsername] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [amountError, setAmountError] = useState('');
  const [mpesaError, setMpesaError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal state
  const [balance, setBalance] = useState(5000.0); // Balance state
  const [transactions, setTransactions] = useState([]); // Transaction history state

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

  // Validate withdrawal amount
  const validateAmount = (amount) => {
    if (!amount) {
      setAmountError('Amount is required');
      return false;
    }
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber)) {
      setAmountError('Invalid amount');
      return false;
    }
    if (amountNumber < 900) {
      setAmountError('Minimum withdrawal is KSH 900');
      return false;
    }
    if (amountNumber > balance) {
      setAmountError('Insufficient balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  // Validate M-Pesa number
  const validateMpesaNumber = (number) => {
    if (!number) {
      setMpesaError('M-Pesa number is required');
      return false;
    }
    if (number.length !== 10 || isNaN(number)) {
      setMpesaError('Invalid M-Pesa number');
      return false;
    }
    setMpesaError('');
    return true;
  };

  // Handle withdrawal
  const handleWithdrawal = () => {
    const isAmountValid = validateAmount(withdrawalAmount);
    const isMpesaValid = validateMpesaNumber(mpesaNumber);

    if (isAmountValid && isMpesaValid) {
      setIsLoading(true); // Show loader

      // Simulate a 4-second loading process
      setTimeout(() => {
        setIsLoading(false); // Hide loader
        setIsModalVisible(true); // Show modal

        // Deduct withdrawal amount from balance
        setBalance((prevBalance) => prevBalance - parseFloat(withdrawalAmount));

        // Add the transaction to the history
        const newTransaction = {
          id: Date.now().toString(), // Unique ID for the transaction
          amount: withdrawalAmount,
          mpesaNumber: mpesaNumber,
          time: new Date().toLocaleTimeString(), // Current time
        };
        setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
      }, 4000);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
    // Reset fields after successful withdrawal
    setWithdrawalAmount('');
    setMpesaNumber('');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Balance Overview Section */}
      <LinearGradient
        colors={['#5DB996', '#118B50']} // Gradient colors
        style={styles.balanceContainer}
      >
        <Text style={styles.username}>Hello, {username}</Text>
        <View style={styles.balanceContent}>
          <Icon name="wallet" size={30} color="#FBF6E9" style={styles.walletIcon} />
          <View>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>KSH {balance.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Withdrawal Details Section */}
      <View style={styles.withdrawalContainer}>
        <Text style={styles.sectionTitle}>Withdrawal Details</Text>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount (KSH)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={withdrawalAmount}
            onChangeText={(text) => {
              setWithdrawalAmount(text);
              validateAmount(text);
            }}
          />
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
        </View>

        {/* M-Pesa Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>M-Pesa Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter M-Pesa number"
            keyboardType="phone-pad"
            value={mpesaNumber}
            onChangeText={(text) => {
              setMpesaNumber(text);
              validateMpesaNumber(text);
            }}
          />
          {mpesaError ? <Text style={styles.errorText}>{mpesaError}</Text> : null}
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdrawal}>
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History Section */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Icon name="checkmark-circle" size={24} color="#5DB996" style={styles.transactionIcon} />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionText}>
                  KSH {transaction.amount} sent to {transaction.mpesaNumber}
                </Text>
                <Text style={styles.transactionTime}>{transaction.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={50} color="#5DB996" />
            <Text style={styles.emptyStateText}>No recent transactions</Text>
            <Text style={styles.emptyStateSubtext}>
              Start using your wallet to see transaction history here.
            </Text>
          </View>
        )}
      </View>

      {/* Loader */}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5DB996" />
          <Text style={styles.loaderText}>Processing withdrawal...</Text>
        </View>
      )}

      {/* Success Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Icon name="checkmark-circle" size={50} color="#5DB996" />
            <Text style={styles.modalTitle}>Withdrawal Successful</Text>
            <Text style={styles.modalText}>
              KSH {withdrawalAmount} will be sent to {mpesaNumber}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6E9',
    padding: 15,
  },
  balanceContainer: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FBF6E9',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    marginRight: 15,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FBF6E9',
    fontFamily: 'Inter-Regular',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FBF6E9',
    fontFamily: 'Inter-Bold',
    marginTop: 5,
  },
  withdrawalContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FBF6E9',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  withdrawButton: {
    backgroundColor: '#5DB996',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  transactionTime: {
    fontSize: 12,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loaderText: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#5DB996',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#5DB996',
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});

export default WalletScreen;