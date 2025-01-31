import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Task 1', description: 'Description for Task 1' },
    { id: '2', title: 'Task 2', description: 'Description for Task 2' },
    { id: '3', title: 'Task 3', description: 'Description for Task 3' },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </View>
  );

  const handleAddTask = () => {
    Alert.alert('Add Task', 'This feature is not implemented yet.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to JibuCash Tasks</Text>
      <Text style={styles.subtitle}>Your Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.taskList}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Icon name="add-circle" size={50} color="#118B50" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FBF6E9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
  },
  taskList: {
    paddingBottom: 20,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#118B50',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#118B50',
    fontFamily: 'Inter-Regular',
  },
  taskDescription: {
    fontSize: 14,
    color: '#118B50',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});

export default HomeScreen;