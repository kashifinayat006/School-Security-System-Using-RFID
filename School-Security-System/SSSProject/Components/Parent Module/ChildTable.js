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


const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Parent Account</Text>
    </View>
  );
}


const ChildTable = () => {
  const [userUid, setUserUid] = useState('');
  const [students, setStudents] = useState([]);
  const [isStudentsLoaded, setIsStudentsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [cardID, setCardID] = useState('');
  const [parentCNIC, setParentCNIC] = useState('');

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid, cnic } = session;

        setCardID(uid);
        setParentCNIC(cnic);
       
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }
  };

  useEffect(() => {
    getUID();
  }, []);

  useEffect(() => {
    getUID();

    const dbRef = ref(getDatabase());
    const studentsRef = child(dbRef, `StudentData/`);

    const onStudentDataChange = onValue(studentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const studentList = [];
        let index = 1;

        snapshot.forEach((parentSnapshot) => {
          const parentCnic = parentSnapshot.key;

          if (parentCnic === parentCNIC) {
            parentSnapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              const id = data.ID;
              const firstName = data.firstname;
              const lastName = data.lastname;
              const className = data.cName; // Add class name field

              const student = {
                number: index,
                id,
                firstName,
                lastName,
                className,
              };
              studentList.push(student);
              index++;
            });
          }
        });

        setStudents(studentList);
        setIsStudentsLoaded(true);
        setIsLoading(false);
      }
    });

    return () => {
      // Clean up the listener when the component is unmounted
      onStudentDataChange();
    };
  }, [parentCNIC]);


 

  return (
    
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}

    start={{ x: 1, y: 2 }}
    end={{ x: 3, y: 1 }}
    style={styles.container}
    
  >
    
    <HeaderTop />
    <View style={styles.externalListConatiner}>
    <View style={styles.enrolledStudentsContainer}>
          <Text style={styles.enrolledStudentsText}>My Children</Text>
          
        </View>
        <View style={styles.tableHeader}>
          
            <Text style={styles.columnHeader}>First Name</Text>
            <Text style={styles.columnHeader}>Last Name</Text>
            <Text style={styles.columnHeader}>Class</Text>
          </View>
      {isLoading ? (
       
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View>
          
          
        </View>
      )}

     
        
          {isStudentsLoaded ? (
            
        <View > 
          
          <ScrollView  >
          {students.map((student, index) => (
             
            
            <View 
              style={[styles.studentRow, index % 2 === 1 ? styles.alternateRow : null,styles.listContainer]}
              key={student.id}
            >
              
             
              <Text style={styles.cellText}>{student.firstName}</Text>
              <Text style={styles.cellText}>{student.lastName}</Text>
              <Text style={styles.cellText}>{student.className}</Text>
            </View>
          
          ))}
          </ScrollView>
        </View>
      ) : null}
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
   flex:1,
    padding: 0,
    justifyContent: 'center',// Light gray background
  },
 
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
  // marginLeft:"0%",
  // marginRight:"0%",
  //  marginTop:"0%",
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
    marginTop: 4,
    width:'100%',
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
   height:'90%',
    borderRadius:30,
    borderTopRightRadius:0,
    borderTopLeftRadius:0,
  marginLeft:12,
  marginRight:12,
  marginBottom:-274,
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
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
    // Negative margin to extend on the right
   justifyContent: 'center',
   alignItems: 'center',
   height: 60,
  marginTop:-290,
  
  
   borderBottomLeftRadius: 22,
   borderBottomRightRadius: 22,
  },
    headerText: {
      color: 'white', // White color for the header text
      fontWeight: 'bold',
      fontStyle: 'italic',
      fontSize: 20,
    },
  
});

export default ChildTable;
