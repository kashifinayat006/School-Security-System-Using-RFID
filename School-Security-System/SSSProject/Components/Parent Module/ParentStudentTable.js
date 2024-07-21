import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, child, get, getDatabase, onValue } from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';

const StudentTable = () => {
  const [userUid, setUserUid] = useState('');
  const [cl, setCl] = useState('');
  const [students, setStudents] = useState([]);
  const [isStudentsLoaded, setIsStudentsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check internet connection and load data
    if (isConnected) {
      getUID();
    } else {
      setIsLoading(false); // No internet, stop loading
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
    }
  }, [isConnected]);

  useEffect(() => {
    // Initialize student data
    const dbRef = ref(getDatabase());

    get(child(dbRef, `ClassRoom/${cl}/Students/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const studentList = [];
          let index = 1;

          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const id = data.ID;
            const firstName = data.firstName;
            const lastName = data.lastName;

            // Create a student object with a number and add it to the list
            const student = {
              number: index,
              id,
              firstName,
              lastName,
            };
            studentList.push(student);
            index++;
          });

          // Update the state with the student data
          setStudents(studentList);
          setIsStudentsLoaded(true); // Mark students as loaded
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [cl]);

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID } = session;

        setUserUid(CardID);
        getClass(CardID); // Pass the UID to getClass
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
      setIsLoading(false); // Stop loading on error
    }
  };

  function getClass(uid) {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `TeacherData/${uid}/class`);

    // Set up a listener for real-time updates
    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        const myclass = snapshot.val();
        setCl(myclass);
      } else {
        console.log('No data available');
      }

      setIsLoading(false); // Stop loading when data is fetched
    });
  }

  // Styling
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: '#F0F0F0', // Light gray background
    },
    classText: {
      fontSize: 20,
      marginVertical: 10,
      fontWeight: 'bold',
      color: '#333', // Dark gray text
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
      backgroundColor: '#0074e4',
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    columnHeader: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
    studentRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      backgroundColor: 'white',
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 3,
    },
    cellText: {
      flex: 1,
      fontSize: 16,
      textAlign: 'center',
      color: '#333', // Dark gray text
    },
    alternateRow: {
      backgroundColor: '#F5F5F5', // Light gray background for alternate rows
    },
  });

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Text style={styles.classText}>Class: {cl}</Text>
      )}

      {isStudentsLoaded ? (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.columnHeader}>Student ID</Text>
            <Text style={styles.columnHeader}>First Name</Text>
            <Text style={styles.columnHeader}>Last Name</Text>
          </View>
          {students.map((student, index) => (
            <View
              style={[styles.studentRow, index % 2 === 1 ? styles.alternateRow : null]}
              key={student.id}
            >
              <Text style={styles.cellText}>{student.id}</Text>
              <Text style={styles.cellText}>{student.firstName}</Text>
              <Text style={styles.cellText}>{student.lastName}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
};

export default StudentTable;
