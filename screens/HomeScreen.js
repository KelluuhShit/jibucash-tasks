import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl, ActivityIndicator,Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../services/firebase';
import { getInitialTasks, getPersonalQuizzesTasks, getHealthWellnessTasks, getGeneralKnowledgeTasks, getMoneySavingsTasks } from '../data/tasks'; // Updated imports
import fetchQuizDataFromFirestore from '../data/quizData';
import CircularProgress from 'react-native-circular-progress-indicator';

const SkeletonTaskCard = () => {
  const shineAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1, // Move to right
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shineAnim]);

  const translateX = shineAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200], // Adjust based on skeleton width
  });

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonDescription} />
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonAmount} />
        <View style={styles.skeletonButton} />
      </View>
      <Animated.View style={[styles.shineOverlay, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)']}
          style={styles.gradientShine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

const initializeTasksWithTimeLeft = (tasks) => {
  if (!Array.isArray(tasks)) {
    console.error('tasks is not an array:', tasks);
    return [];
  }
  return tasks.map(task => ({
    ...task,
    timeLeft: task.expiry - Date.now()
  }));
};

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [standardTasks, setStandardTasks] = useState([]);
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userBalance, setUserBalance] = useState(0.00);
  const [completedTasksToday, setCompletedTasksToday] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [topicLoading, setTopicLoading] = useState({
    available: false,
    personal: false,
    health: false,
    general: false,
    money: false,
  });


  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTasks(true);
      try {
        const initial = await getInitialTasks();
        console.log('Initial Tasks:', initial);
        setTasks(initializeTasksWithTimeLeft(initial));

        const personal = await getPersonalQuizzesTasks();
        const health = await getHealthWellnessTasks();
        const general = await getGeneralKnowledgeTasks();
        const money = await getMoneySavingsTasks();

        const shuffledStandardTasks = [
          ...(personal || []).slice(0, 2),
          ...(health || []).slice(0, 2),
          ...(general || []).slice(0, 2),
          ...(money || []).slice(0, 2),
        ].sort(() => Math.random() - 0.5).map((task, index) => ({ ...task, id: `${task.category}-${index}` }));
        setStandardTasks(shuffledStandardTasks);

        const quizzes = await fetchQuizDataFromFirestore();
        console.log('Quiz Data:', quizzes);
        setQuizData(quizzes);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTasks([]);
        setStandardTasks([]);
        setQuizData([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchData();
  }, []);

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
        setUsername(storedUsername || 'User');
      } catch (error) {
        console.error('Error fetching username: ', error);
      }
    };
    fetchUsername();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchSubscription = async () => {
        try {
          const storedSubscription = await AsyncStorage.getItem('subscription');
          setSubscription(storedSubscription || 'Basic');
          console.log('Subscription fetched on focus:', storedSubscription || 'Basic');
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscription('Basic');
        }
      };
      fetchSubscription();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const updateSubscription = async () => {
        try {
          const storedSubscription = await AsyncStorage.getItem('subscription');
          if (storedSubscription) {
            setSubscription(storedSubscription);
          }
        } catch (error) {
          console.error('Error updating subscription on focus:', error);
        }
      };
      updateSubscription();
    }, [])
  );



  useEffect(() => {
    const loadBalance = async () => {
      try {
        const storedBalance = await AsyncStorage.getItem('userBalance');
        setUserBalance(storedBalance ? parseFloat(storedBalance) : 0);
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    };
    loadBalance();
  }, []);

  useEffect(() => {
    const loadTaskCount = async () => {
      try {
        const storedCount = await AsyncStorage.getItem('completedTasksToday');
        const storedDate = await AsyncStorage.getItem('lastResetDate');
        const today = new Date().toDateString();
        if (storedDate !== today) {
          setCompletedTasksToday(0);
          setLastResetDate(today);
          await AsyncStorage.setItem('completedTasksToday', '0');
          await AsyncStorage.setItem('lastResetDate', today);
        } else {
          setCompletedTasksToday(storedCount ? parseInt(storedCount, 10) : 0);
          setLastResetDate(storedDate);
        }
      } catch (error) {
        console.error('Error loading task count:', error);
      }
    };
    loadTaskCount();
  }, []);

  useEffect(() => {
    const loadCompletedTasks = async () => {
      try {
        const storedCompleted = await AsyncStorage.getItem('completedTaskIds');
        const storedDate = await AsyncStorage.getItem('lastResetDate');
        const today = new Date().toDateString();
        if (storedDate !== today) {
          setCompletedTaskIds([]);
          setCompletedTasksToday(0);
          setLastResetDate(today);
          await AsyncStorage.multiSet([
            ['completedTaskIds', JSON.stringify([])],
            ['completedTasksToday', '0'],
            ['lastResetDate', today]
          ]);
        } else {
          setCompletedTaskIds(storedCompleted ? JSON.parse(storedCompleted) : []);
          setCompletedTasksToday(parseInt(await AsyncStorage.getItem('completedTasksToday') || '0', 10));
          setLastResetDate(storedDate);
        }
      } catch (error) {
        console.error('Error loading completed tasks:', error);
      }
    };
    loadCompletedTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          if (!completedTaskIds.includes(task.id) && task.timeLeft > 0) {
            const timeLeft = Math.max(0, task.expiry - Date.now());
            return { ...task, timeLeft };
          }
          return task;
        });
        return [...updatedTasks]; // New array reference to force re-render
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [completedTaskIds]);

  useEffect(() => {
    if (selectedTask) {
      const quizCategory = quizData.find(q => q.category === selectedTask.category);
      setSelectedQuiz(quizCategory || null);
    }
  }, [selectedTask, quizModalVisible]);

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        try {
          const initial = await getInitialTasks();
          setTasks(initializeTasksWithTimeLeft(initial));
        } catch (error) {
          console.error('Error fetching tasks on focus:', error);
          setTasks([]);
        }
      };
      fetchTasks();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const initial = await getInitialTasks();
      const shuffledTasks = initializeTasksWithTimeLeft(initial).sort(() => Math.random() - 0.5);
      setTasks(shuffledTasks);

      const personal = await getPersonalQuizzesTasks();
      const health = await getHealthWellnessTasks();
      const general = await getGeneralKnowledgeTasks();
      const money = await getMoneySavingsTasks();

      const shuffledStandardTasks = [
        ...(personal || []).slice(0, 2),
        ...(health || []).slice(0, 2),
        ...(general || []).slice(0, 2),
        ...(money || []).slice(0, 2),
      ].sort(() => Math.random() - 0.5).map((task, index) => ({ ...task, id: `${task.category}-${index}` }));
      setStandardTasks(shuffledStandardTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setTasks([]);
      setStandardTasks([]);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isInitialTask = item.category === 'initial';
    const isCompleted = completedTaskIds.includes(item.id);
  
    // Calculate time components directly from timeLeft
    const timeLeft = item.timeLeft || 0;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
    return (
      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.expiryInfo}>
          {isCompleted ? 'Task Completed' : `Expires in ${hours}h ${minutes}m ${seconds}s`}
        </Text>
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
            <TouchableOpacity
              style={[styles.startButton, isCompleted && styles.disabledButton]}
              onPress={() => handleStartTask(item, isInitialTask)}
              disabled={isCompleted}
            >
              <Text style={styles.startButtonText}>
                {isCompleted ? '✓ Completed' : 'Start Task'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.subscribeButton, isCompleted && styles.disabledButton]}
              onPress={() => setSubscriptionModalVisible(true)}
              disabled={isCompleted}
            >
              <Text style={styles.subscribeButtonText}>
                {isCompleted ? 'Completed' : 'Start Task'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleStartTask = (item, isInitialTask) => {
    if (completedTaskIds.includes(item.id)) {
      setModalMessage('This task has already been completed today!');
      setModalVisible(true);
      return;
    }
    if (subscription === 'Basic' && !isInitialTask) {
      setSubscriptionModalVisible(true);
    } else {
      const selectedQuiz = quizData.find(q => q.category === item.category)?.questions || [];
      setSelectedTask(item);
      setModalTasks(selectedQuiz);
      setModalMessage(item.title);
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

  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
    setAnswerFeedback(null);
  };

  const filteredQuizData = quizData.filter(item => item.category === modalMessage);
  const questions = filteredQuizData.length > 0 ? filteredQuizData[0].questions : [];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      setAnswerFeedback('Please select an option.');
      return;
    }
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    console.log("Selected Option:", selectedOption);
    console.log("Correct Answer:", correctAnswer);
    console.log("Comparison Result:", selectedOption === correctAnswer);
    if (selectedOption === correctAnswer) {
      setAnswerFeedback('✅ Correct Answer!');
    } else {
      setAnswerFeedback('❌ Wrong Answer, Try Again');
    }
    setTimeout(() => {
      if (selectedOption === correctAnswer) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
          setAnswerFeedback(null);
        } else {
          setAnswerFeedback("🎉 Quiz Completed! You've earned rewards.");
          setTimeout(() => {
            setQuizModalVisible(false);
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setAnswerFeedback(null);
          }, 2000);
        }
      } else {
        setSelectedOption(null);
      }
    }, 1000);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  useEffect(() => {
    if (quizModalVisible) {
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
    }
  }, [quizModalVisible]);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      handleOptionSelect(selectedOption);
      setQuizCompleted(true);
      console.log("Submitting last selection:", selectedOption);
    }
  };

  const handleClaimEarnings = async () => {
    if (!selectedTask?.amount || !selectedTask?.id) return;
    try {
      if (completedTasksToday >= 3) {
        setModalMessage('You have reached the daily limit of 3 completed tasks!');
        setModalVisible(true);
        setQuizModalVisible(false);
        return;
      }
      if (completedTaskIds.includes(selectedTask.id)) {
        setModalMessage('This task has already been completed today!');
        setModalVisible(true);
        setQuizModalVisible(false);
        return;
      }
      const taskAmount = parseFloat(selectedTask.amount);
      const newBalance = userBalance + taskAmount;
      setUserBalance(newBalance);
      const newCount = completedTasksToday + 1;
      const newCompletedIds = [...completedTaskIds, selectedTask.id];
      setCompletedTasksToday(newCount);
      setCompletedTaskIds(newCompletedIds);
      await Promise.all([
        AsyncStorage.setItem('userBalance', newBalance.toString()),
        AsyncStorage.setItem('completedTasksToday', newCount.toString()),
        AsyncStorage.setItem('completedTaskIds', JSON.stringify(newCompletedIds)),
        AsyncStorage.setItem('lastResetDate', new Date().toDateString())
      ]);
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setAnswerFeedback(null);
      setQuizModalVisible(false);
      setModalMessage(`Successfully claimed KSH ${taskAmount}! New balance: KSH ${newBalance}`);
      setModalVisible(true);
    } catch (error) {
      console.error('Error claiming earnings:', error);
      setModalMessage('Error claiming earnings. Please try again.');
      setModalVisible(true);
    }
  };
  


  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.header}>
        <View style={styles.infoIcon}>
          <Icon name="person-circle" size={40} color="#E3F0AF" />
          <View style={styles.walletSection}>
            <Text style={styles.walletBalance}>Balance: KSH {userBalance.toFixed(2)}</Text>
          </View>
          <Icon name="notifications" size={30} color="#E3F0AF" style={styles.notificationIcon} />
        </View>
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userId}>ID: {userId}</Text>
            <Text style={styles.subscription}>Subscription: {subscription}</Text>
          </View>
          <View>
            <Text style={styles.username}>Completed Today</Text>
            <Text style={styles.taskCount}>{completedTasksToday} / 3 Tasks</Text>
          </View>
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
            <TouchableOpacity style={styles.topicButtonStandard} onPress={async () => showModal('Personal Quizzes', await getPersonalQuizzesTasks())}>
              <Text style={styles.topicButtonText}>Personal Quizzes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={async () => showModal('Health & Wellness', await getHealthWellnessTasks())}>
              <Text style={styles.topicButtonText}>Health & Wellness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={async () => showModal('General Knowledge', await getGeneralKnowledgeTasks())}>
              <Text style={styles.topicButtonText}>General Knowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topicButtonStandard} onPress={async () => showModal('Money & Savings', await getMoneySavingsTasks())}>
              <Text style={styles.topicButtonText}>Money & Savings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Complete Available Tasks Now and Unlock New Level</Text>
          <Icon name="star" size={20} color="orange" style={styles.medalIcon} />
        </View>
        <View style={styles.taskItems}>
          <Text style={styles.subtitle}>Your Tasks [3]</Text>
        </View>
        {isLoadingTasks ? (
          <View>
            <SkeletonTaskCard />
            <SkeletonTaskCard />
            <SkeletonTaskCard />
          </View>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.taskList}
          />
        )}
        <Text style={styles.title}>Standard Tasks</Text>
        {isLoadingTasks ? (
          <View>
            <SkeletonTaskCard />
            <SkeletonTaskCard />
          </View>
        ) : (
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
        )}
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
              Upgrade to Standard for just KSH 150 or explore Premium and Elite for even more earnings!
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
      
      {/* Display the task amount */}
      <Text style={styles.amountText}>Expected to Earn: KSH {selectedTask ? selectedTask.amount : "N/A"}</Text>

      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => {
          setIsLoading(true); // Show loader

          setTimeout(() => {
            setIsLoading(false); // Hide loader
            setConfirmationModalVisible(false); // Close confirmation modal
            setQuizModalVisible(true); // Open quiz modal
          }, 3000); // 3 seconds delay
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" /> // Loader while waiting
        ) : (
          <Text style={styles.proceedButtonText}>Proceed To Task</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeConfirm}
        onPress={() => setConfirmationModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  animationType="fade"
  transparent={true}
  visible={quizModalVisible}
>
  <View style={styles.modalContainer}>
  
    <View style={styles.modalQuizContent}>
        {quizCompleted ? (
          <View style={styles.completionContainer}>
          <CircularProgress
            value={100} // Represents 100% completion
            radius={90} // Size of the progress circle
            duration={2000} // Animation duration in milliseconds
            progressValueColor={'#5DB996'} // Green color for progress value
            maxValue={100}
            title={'Calculating'}
            titleColor={'#333'}
            titleStyle={{ fontSize: 12 }}
            inActiveStrokeColor={'#E0E0E0'} // Grey inactive stroke
            inActiveStrokeOpacity={0.5}
            inActiveStrokeWidth={5}
            activeStrokeColor={'#5DB996'} // Green active stroke
            activeStrokeWidth={10}
          />
          <Text style={styles.completionText}>QUIZ COMPLETED. EARNINGS ARE BEING CALCULATED.</Text>
          <Text style={styles.amountText}>You have earned: KSH {selectedTask ? selectedTask.amount : "N/A"}</Text>

          <TouchableOpacity style={styles.claimButton} onPress={handleClaimEarnings}>
            {/* Update userbalance using the selectedTask amount */}
            <Text style={styles.claimButtonText}>Claim Earnings</Text>
          </TouchableOpacity>
        </View>
    ) : (
      <>
      <Text style={styles.quizTitle}>Task Time: {modalMessage}</Text>

      
    {questions.length > 0 ? (
      <FlatList
        data={[questions[currentQuestionIndex]]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.questionContainer}>
            <Text style={styles.question}>{item.question}</Text>
            {item.options.map((option, oIndex) => {
              const isSelected = selectedOption === option;
              return (
                <TouchableOpacity
                  key={oIndex}
                  style={[styles.optionButton, isSelected && styles.selectedOption]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
    ) : (
      <Text style={styles.noDataText}>No questions available for this category.</Text>
    )}
  


      {/* Answer Feedback */}
      {answerFeedback && (
        <Text
          style={[
            styles.feedbackText,
            answerFeedback.includes('✅') ? styles.correctText : styles.wrongText,
          ]}
        >
          {answerFeedback}
        </Text>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, selectedOption === null && styles.disabledButton]}
            onPress={handleNextQuestion}
            disabled={selectedOption === null}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, selectedOption === null && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={selectedOption === null}
          >
            <Text style={styles.submitButtonText}>Submit </Text>
          </TouchableOpacity>
        )}
      </View>
      </>
    )}
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
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
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
  taskCount: {
    fontSize: 14,
    color: 'orange',
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
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    marginTop: 5,
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
    fontFamily: 'Inter-Regular',
  },
  modalQuizText: {
    fontSize: 16,
    color: '#118B50',
    textAlign: 'start',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  taskName: {
    fontWeight: 'bold',
    color: 'orange',
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
  },
  claimButton: {
    backgroundColor: '#118B50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#118B50',
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
  quizQuestionContainer: {
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#5DB996',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeConfirm: {
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
    fontFamily: 'Inter-Regular',
  },
  questionContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  optionButton: {
    borderWidth:2,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor:'#5DB996'
  },
  optionText: {
    fontSize: 16,
    color: '#5DB996',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  selectedOption: {
    backgroundColor: '#5DB996',
  },
  selectedOptionText: {
    color: '#fff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#5DB996',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    backgroundColor: '#118B50',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign:'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
 
  noDataText: {
    fontSize: 16,
    color: '#888',
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completionText: {
    fontSize: 16,
    color: '#5DB996',
    marginTop: 15,
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  skeletonContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    overflow: 'hidden', // Ensures gradient stays within bounds
    position: 'relative',
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#D0D0D0',
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '90%',
    height: 15,
    backgroundColor: '#D0D0D0',
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonAmount: {
    width: 80,
    height: 20,
    backgroundColor: '#D0D0D0',
    borderRadius: 5,
  },
  skeletonButton: {
    width: 100,
    height: 30,
    backgroundColor: '#D0D0D0',
    borderRadius: 5,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100, // Width of the shining effect
  },
  gradientShine: {
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;