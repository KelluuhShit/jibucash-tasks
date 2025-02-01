import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Task 1', description: 'Description for Task 1', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 9 },
    { id: '2', title: 'Task 2', description: 'Description for Task 2', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 4 },
    { id: '3', title: 'Task 3', description: 'Description for Task 3', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 7 },
  ]);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [subscription, setSubscription] = useState('Basic');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTasks, setModalTasks] = useState([]);

  const personalQuizzesTasks = [
    { id: '1', title: 'Social Skills', description: 'Show your ability to interact with others in different situations.', amount: 80 },
    { id: '2', title: 'Money Management', description: 'Demonstrate how you handle finances responsibly.', amount: 85 },
    { id: '3', title: 'Time Management', description: 'Showcase your efficiency in organizing and prioritizing tasks.', amount: 90 },
    { id: '4', title: 'Risk-Taking Ability', description: 'Express your approach to making bold or calculated decisions.', amount: 88 },
    { id: '5', title: 'Productivity Habits', description: 'Highlight the strategies you use to stay focused and efficient.', amount: 87 },
    { id: '6', title: 'Emotional Intelligence', description: 'Display your awareness and management of emotions in daily life.', amount: 89 },
    { id: '7', title: 'Decision-Making Skills', description: 'Prove your ability to analyze situations and make smart choices.', amount: 86 },
  ];

  useEffect(() => {
    const generateUserId = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };

    const getUserId = async () => {
      try {
        let storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          storedUserId = generateUserId();
          await AsyncStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error getting user ID: ', error);
      }
    };

    getUserId();
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        const timeLeft = task.expiry - Date.now();
        return { ...task, timeLeft };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => {
    const hours = Math.floor(item.timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((item.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((item.timeLeft % (1000 * 60)) / 1000);

    return (
      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.expiryInfo}>Expires in {hours}h {minutes}m {seconds}s</Text>
        <View style={styles.taskFooter}>
          <View style={styles.amountContainer}>
            <Icon name="cash" size={20} color="orange" />
            <Text style={styles.amountText}>KSH {item.amount}</Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={() => showModal(`Starting ${item.title}`)}>
            <Text style={styles.startButtonText}>Start Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const showModal = (message, tasks = []) => {
    setModalMessage(message);
    setModalTasks(tasks);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalMessage('');
    setModalTasks([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.infoIcon}>
          <Icon name="person-circle" size={40} color="#E3F0AF" />
          <View style={styles.walletSection}>
            <Text style={styles.walletBalance}> Balance: KSH 0.00</Text>
          </View>
          <Icon name="notifications" size={30} color="#E3F0AF" style={styles.notificationIcon} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userId}>ID: {userId}</Text>
          <Text style={styles.subscription}>Subscription: {subscription}</Text>
        </View>
      </View>
      <View style={styles.homeContent}>
        <View style={styles.selectTopic}>
          <Text style={styles.title}>Select Topic</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicSelectActions}>
            <TouchableOpacity style={styles.topicButton} onPress={() => showModal('Available Tasks', tasks)}>
              <Icon name="checkmark-circle" size={20} color="#FBF6E9" />
              <Text style={styles.topicButtonText}>Available</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButton} onPress={() => showModal('Personal Quizzes', personalQuizzesTasks)}>
              <Text style={styles.topicButtonText}>Personal Quizzes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButton} onPress={() => showModal('Selecting Health & Wellness')}>
              <Text style={styles.topicButtonText}>Health & Wellness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButton} onPress={() => showModal('Selecting General Knowledge')}>
              <Text style={styles.topicButtonText}>General Knowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButton} onPress={() => showModal('Selecting Money & Savings')}>
              <Text style={styles.topicButtonText}>Money & Savings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Complete Available Tasks Now and Unlock New Level</Text>
          <Icon name="medal" size={24} color="orange" style={styles.medalIcon} />
        </View>
        <View style={styles.taskItems}>
          <Text style={styles.subtitle}>Your Tasks [3] </Text>
        </View>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <FlatList
              data={modalTasks}
              renderItem={({ item }) => (
                <View style={styles.taskContainer}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDescription}>{item.description}</Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.amountContainer}>
                      <Icon name="cash" size={20} color="orange" />
                      <Text style={styles.amountText}>KSH {item.amount}</Text>
                    </View>
                    <TouchableOpacity style={styles.startButton} onPress={() => showModal(`Starting ${item.title}`)}>
                      <Text style={styles.startButtonText}>Start Task</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.taskList}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
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
  },
  header: {
    flexDirection: 'column',
    backgroundColor: '#5DB996',
    width: '100%',
    height: 200,
  },
  walletBalance: {
    fontSize: 18,
    color: '#FBF6E9',
    fontFamily: 'Inter-Bold',
    },
  infoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  userInfo: {
    marginLeft: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FBF6E9',
    fontFamily: 'Inter-Bold',
  },
  userId: {
    fontSize: 14,
    color: '#FBF6E9',
    fontFamily: 'Inter-Regular',
  },
  subscription: {
    fontSize: 14,
    color: '#FBF6E9',
    fontFamily: 'Inter-Regular',
  },
  notificationIcon: {
    marginLeft: 'auto',
  },
  homeContent: {
    padding: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
  },
  medalIcon: {
    marginLeft: 5,
  },
  taskItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  expiryInfo: {
    fontSize: 10,
    color: 'red',
    fontFamily: 'Inter-Regular',
  },
  taskContainer: {
    backgroundColor: '#FBF6E9',
    padding: 15,
    borderRadius: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#118B50',
    width: '100%',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  taskDescription: {
    fontSize: 13,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 12,
    color: 'orange',
    marginLeft: 5,
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    backgroundColor: '#118B50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  startButtonText: {
    color: '#FBF6E9',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  topicSelectActions: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  topicButton: {
    backgroundColor: '#5DB996',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicButtonText: {
    color: '#FBF6E9',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FBF6E9',
    padding: 20,
    borderRadius: 2,
    alignItems: 'center',
    width: '100%',
    maxHeight: '100%',
  },
  modalText: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#5DB996',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
    marginTop: 20,
    width:'100%'
  },
  closeButtonText: {
    color: '#FBF6E9',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign:'center',
  },
  taskList: {
    width: '100%',
  },
});

export default HomeScreen;