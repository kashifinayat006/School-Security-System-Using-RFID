import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,ScrollView
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
    const fetchData = async () => {
      try {
        const sessionString = await AsyncStorage.getItem('userSession');
        if (sessionString) {
          const session = JSON.parse(sessionString);
          const { CardID } = session;

          setUserUid(CardID);
          getClass(CardID);
        }
      } catch (error) {
        console.log('Error checking saved session:', error);
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up a listener for real-time updates
    const dbRef = ref(getDatabase());
    const studentsRef = child(dbRef, `ClassRoom/${cl}/Students/`);

    const onStudentDataChange = onValue(studentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const studentList = [];
        let index = 1;

        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          const id = data.ID;
          const firstName = data.firstName;
          const lastName = data.lastName;

          const student = {
            number: index,
            id,
            firstName,
            lastName,
          };
          studentList.push(student);
          index++;
        });

        setStudents(studentList);
        setIsStudentsLoaded(true);
      }
    });

    return () => {
      // Clean up the listener when the component is unmounted
      onStudentDataChange();
    };
  }, [cl]);

  const getClass = (uid) => {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `TeacherData/${uid}/class`);

    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        const myclass = snapshot.val();
        setCl(myclass);
      } else {
        console.log('No data available');
      }

      setIsLoading(false);
    });
  };

  // Styling
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: '#F0F0F0', // Light gray background
    },
   
    tableHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      backgroundColor: '#054f96',
    marginLeft:12,
    marginRight:"3%",
     marginTop:0,
      flexDirection: 'row',
      paddingVertical: 8,
      
    
     
      justifyContent: 'space-between',
    
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
    enrolledStudentsContainer: {
     paddingTop:10,
      fontSize: 20,
      fontWeight: 'bold',
      backgroundColor: '#0A2558',
     
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      color: 'white',
      textAlign: 'center',
      marginTop: 1,
      width:360,
      marginLeft:0,
      marginRight:0,
      alignSelf: 'center',
  
    },
    enrolledStudentsText: {
      fontSize: 20,
      marginBottom: 10,
      fontWeight: 'bold',
      color: 'white',
      textAlign:'center',
    },
    externalListConatiner: {
      borderWidth: 0,
      
      borderColor: 'grey',
     height:'54%',
      borderRadius:30,
      borderTopRightRadius:0,
      borderTopLeftRadius:0,
    marginLeft:12,
    marginRight:12,
      backgroundColor: '#FFFAF0', // Light grey background
      shadowColor: 'black',// black color
      shadowOffset: { width: 9, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    listContainer: {
      borderWidth: 0,
      borderColor: '#550A35',
      backgroundColor: 'white', 
      shadowColor: '#000',
      
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
  });

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}
  
    start={{ x: 2, y: 3 }}
    end={{ x: 1, y: 1 }}
   >
      {isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View style={styles.enrolledStudentsContainer}>
          <Text style={styles.enrolledStudentsText}>Enrolled Students</Text>
          
        </View>
      )}

      {isStudentsLoaded ? (
        <View > 
          <View style={styles.tableHeader}>
            <Text style={styles.columnHeader}>Student ID</Text>
            <Text style={styles.columnHeader}>First Name</Text>
            <Text style={styles.columnHeader}>Last Name</Text>
          </View>
          <ScrollView style={styles.externalListConatiner} >
          {students.map((student, index) => (
             
            
            <View 
              style={[styles.studentRow, index % 2 === 1 ? styles.alternateRow : null,styles.listContainer]}
              key={student.id}
            >
              <Text style={styles.cellText}>{student.id}</Text>
              <Text style={styles.cellText}>{student.firstName}</Text>
              <Text style={styles.cellText}>{student.lastName}</Text>
            </View>
          
          ))}
          </ScrollView>
        </View>
      ) : null}
    </LinearGradient>
  );
};

export default StudentTable;
