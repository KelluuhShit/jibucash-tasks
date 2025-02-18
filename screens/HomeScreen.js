import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet,Image, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../services/firebase';
import { initialTasks, personalQuizzesTasks, healthWellnessTasks, generalKnowledgeTasks, moneySavingsTasks } from '../data/tasks';
import quizData from '../data/quizData';


const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [subscription, setSubscription] = useState('Basic');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTasks, setModalTasks] = useState([]);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // To store the task clicked
  const [selectedQuiz, setSelectedQuiz] = useState(null);

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
    const fetchSubscription = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem('subscription');
        if (storedSubscription) {
          setSubscription(storedSubscription);
        } else {
          await AsyncStorage.setItem('subscription', 'Basic');
          setSubscription('Basic');
        }
      } catch (error) {
        console.error('Error fetching subscription: ', error);
      }
    };

    fetchSubscription();
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

  useEffect(() => {
    if (selectedTask) {
      const quizCategory = quizData.find(q => q.category === selectedTask.category);
      setSelectedQuiz(quizCategory || null);
    }
  }, [selectedTask, quizModalVisible]);

  useFocusEffect(
    useCallback(() => {
      // Reset or update state when the screen comes into focus
      const fetchTasks = async () => {
        // Fetch tasks or reset state here if needed
        setTasks(initialTasks);
      };

      fetchTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);

    
    // Shuffle tasks
    const shuffledTasks = [...initialTasks].sort(() => Math.random() - 0.5);
    const shuffledStandardTasks = [
      ...personalQuizzesTasks.slice(0, 1),
      ...healthWellnessTasks.slice(0, 1),
      ...generalKnowledgeTasks.slice(0, 1),
      ...moneySavingsTasks.slice(0, 1),
    ].sort(() => Math.random() - 0.5).map((task, index) => ({ ...task, id: `${task.category}-${index}` }));
  
    setTasks(shuffledTasks);
    setStandardTasks(shuffledStandardTasks); // <-- Now this works
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const hours = Math.floor(item.timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((item.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((item.timeLeft % (1000 * 60)) / 1000);

    // Check if the task is part of initialTasks using the category property
    const isInitialTask = item.category === 'initial';

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
          {!isInitialTask && (
            <View style={styles.premiumContainer}>
              <Icon name="diamond" size={20} color="blue" />
              <Text style={styles.premiumText}>STANDARD USERS ONLY</Text>
            </View>
          )}
          {isInitialTask ? (
            <TouchableOpacity style={styles.startButton} onPress={() => handleStartTask(item, isInitialTask)}>
            <Text style={styles.startButtonText}>Start Task</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.subscribeButton} onPress={() => setSubscriptionModalVisible(true)}>
              <Text style={styles.subscribeButtonText}>Start Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleStartTask = (item, isInitialTask) => {
    if (subscription === 'Basic' && !isInitialTask) {
      setSubscriptionModalVisible(true);
    } else {
       // Fetch corresponding quiz from quizData.js based on item.category
       const selectedQuiz = quizData.find(q => q.category === item.category)?.questions || [];

    setModalTasks(selectedQuiz); // Set the quiz data in modal state
    setModalMessage(item.title); // Set task title in modal
    setConfirmationModalVisible(true);
    }
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

  const closeSubscriptionModal = () => {
    setSubscriptionModalVisible(false);
  };

  const navigateToDiscover = () => {
    closeSubscriptionModal();
    navigation.navigate('Discover');
    
  };



  const handleAnswer = (question, selectedOption) => {
    if (selectedOption === question.correctAnswer) {
      alert('Correct!');
    } else {
      alert('Incorrect!');
    }
  };

  const [standardTasks, setStandardTasks] = useState([
    ...personalQuizzesTasks.slice(0, 1),
    ...healthWellnessTasks.slice(0, 1),
    ...generalKnowledgeTasks.slice(0, 1),
    ...moneySavingsTasks.slice(0, 1),
  ].map((task, index) => ({ ...task, id: `${task.category}-${index}` })));

  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
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
            <TouchableOpacity style={styles.topicButtonStandard} onPress={() => showModal('Personal Quizzes', personalQuizzesTasks)}>
              <Text style={styles.topicButtonText}>Personal Quizzes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={() => showModal('Health & Wellness', healthWellnessTasks)}>
              <Text style={styles.topicButtonText}>Health & Wellness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={() => showModal('General Knowledge', generalKnowledgeTasks)}>
              <Text style={styles.topicButtonText}>General Knowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={() => showModal('Money & Savings', moneySavingsTasks)}>
              <Text style={styles.topicButtonText}>Money & Savings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Complete Available Tasks Now and Unlock New Level</Text>
          <Icon name="star" size={20} color="orange" style={styles.medalIcon} />
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
        <Text style={styles.title}>Standard Tasks</Text>
        <FlatList
        data={standardTasks}
        renderItem={({ item }) => {
          const isInitialTask = item.category === 'initial';

    return (
      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {!isInitialTask && (
          <View style={styles.premiumContainer}>
            <Icon name="diamond" size={20} color="orange" />
            <Text style={styles.premiumText}>STANDARD USERS ONLY</Text>
          </View>
        )}
        <Text style={styles.taskDescription}>{item.description}</Text>
        <View style={styles.taskFooter}>
          <View style={styles.amountContainer}>
            <Icon name="cash" size={20} color="orange" />
            <Text style={styles.amountText}>KSH {item.amount}</Text>
          </View>
          {isInitialTask ? (
            <TouchableOpacity style={styles.startButton} onPress={() => handleStartTask(item, isInitialTask)}>
              <Text style={styles.startButtonText}>Start Task</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.subscribeButton} onPress={() => setSubscriptionModalVisible(true)}>
              <Text style={styles.subscribeButtonText}>Start Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }}
  keyExtractor={(item, index) => `${item.category}-${index}`}
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
              renderItem={({ item }) => {
                const isInitialTask = item.category === 'initial';
                return (
                  <View style={styles.taskContainer}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    {!isInitialTask && (
                        <View style={styles.premiumContainer}>
                          <Icon name="diamond" size={20} color="orange" />
                          <Text style={styles.premiumText}>STANDARD USERS ONLY</Text>
                        </View>
                      )}
                    <Text style={styles.taskDescription}>{item.description}</Text>
                    <View style={styles.taskFooter}>
                      <View style={styles.amountContainer}>
                        <Icon name="cash" size={20} color="orange" />
                        <Text style={styles.amountText}>KSH {item.amount}</Text>
                      </View>
                      
                      {isInitialTask ? (
                        <TouchableOpacity style={styles.startButton} onPress={() => handleStartTask(item, isInitialTask)}>
                          <Text style={styles.startButtonText}>Start Task</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.subscribeButton} onPress={() => setSubscriptionModalVisible(true)}>
                          <Text style={styles.subscribeButtonText}>Start Task</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.taskList}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={subscriptionModalVisible}
        onRequestClose={closeSubscriptionModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.subscriptionModalContent}>
            <Text style={styles.subscriptionModalText}>
              Hello! {username} 👋 {"\n"}
              You're on Basic Mode and missing out on daily tasks with higher rewards! {"\n"}
              Upgrade to Standard for just KSH 350 or explore Premium and Elite for even more earnings!
            </Text>
            <Text style={styles.subscriptionModalSubText}>Upgrade now and start earning more!</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={navigateToDiscover}>
              <Text style={styles.subscribeButtonText}>Choose Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
  animationType="slide"
  transparent={true}
  visible={confirmationModalVisible}
  onRequestClose={() => setConfirmationModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalQuizContent}>
    <Image source={require("../assets/images/startTask.png")} style={styles.taskImage} />
      <Text style={styles.modalTitle}>Start Task</Text>
      <Text style={styles.modalText}>
        You are about to start the task:{"\n"}
        <Text style={styles.taskName}>{modalMessage}</Text>
      </Text>
      <Text style={styles.instructions}>
        Instructions:{"\n"}
        1. Read each question carefully.{"\n"}
        2. Select the correct answer.{"\n"}
        3. Complete all questions to finish the task.
      </Text>
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => {
          setConfirmationModalVisible(false); // Close confirmation modal
          setQuizModalVisible(true); // Open quiz modal
        }}
      >
        <Text style={styles.proceedButtonText}>Proceed to Task</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setConfirmationModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  animationType="slide"
  transparent={true}
  visible={quizModalVisible}
  onRequestClose={() => setQuizModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalQuizContent}>
      <Text style={styles.quizTitle}>Task Time: {modalMessage}</Text>
      

<FlatList
  data={quizData.filter(item => item.category === modalMessage)} // Filter by modalMessage title
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <View style={styles.card}>

      {item.questions.map((question, qIndex) => (
        <View key={qIndex} style={styles.questionContainer}>
          <Text style={styles.question}>{question.question}</Text>

          {question.options.map((option, oIndex) => (
            <Text key={oIndex} style={styles.option}>- {option}</Text>
          ))}
        </View>
      ))}
    </View>
  )}
  ListEmptyComponent={<Text style={styles.noDataText}>No tasks available for this category.</Text>}
/>
      
      {/* Close Button */}
      {/* <TouchableOpacity style={styles.closeButton} onPress={() => setQuizModalVisible(false)}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity> */}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    marginTop: 10,
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
  subscribeButton: {
    backgroundColor: 'orange',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  subscribeButtonText: {
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
  topicButtonStandard: {
    backgroundColor: 'orange',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems:'center'
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
    width: '100%',
  },
  closeButtonText: {
    color: '#FBF6E9',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  taskList: {
    width: '100%',
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 12,
    color: 'orange',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  subscriptionModalContent: {
    backgroundColor: '#FBF6E9',
    padding: 20,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems:'center',
    width: '90%',
    maxHeight: '90%',
  },
  subscriptionModalText: {
    fontSize: 16,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subscriptionModalSubText: {
    fontSize: 14,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'orange',
  },
  modalQuizContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    width: '100%',
    minHeight: '100%',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 10,
  },
  modalQuizText: {
    fontSize: 16,
    color: '#118B50',
    textAlign: 'start',
    marginBottom: 20,
  },
  taskName: {
    fontWeight: 'bold',
    color: 'orange',
  },
  taskImage: {
    width: 250,  // Adjust width as needed
    height: 250, // Adjust height as needed
    alignSelf: "center",
    marginBottom: 10, // Add some spacing
  },
  instructions: {
    fontSize: 14,
    color: '#118B50',
    marginBottom: 20,
  },
  proceedButton: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 10,
  },
  quizQuestionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#FBF6E9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#118B50',
  },
  cancelButton: {
    backgroundColor: '#5DB996',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  goToNext:{
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  goNextText:{
    color: '#FFFFFF',
    fontSize: 16,
    textAlign:'center'
  }
});

export default HomeScreen;