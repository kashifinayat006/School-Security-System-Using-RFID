import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { auth, database } from '../../firebase/firebaseconfig';
import { ref, get, getDatabase, onValue, child } from 'firebase/database';
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableHighlight } from 'react-native';

const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Teacher Account</Text>
    </View>
  );
}

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [noRecordMessage, setNoRecordMessage] = useState('');
  const [cardID, setCardID] = useState('');
  const [teacherData, setTeacherData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const  CardID  = session.CardID;
        console.log("Card ID of teacher",CardID)

        setCardID(CardID);
        getClass(CardID);
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }
  };

  useEffect(() => {
    getUID();
  }, [cardID]); // Call getUID in the useEffect hook

  function getClass(uid) {
    const dbRef = ref(getDatabase());
    const TeacherDataRef = child(dbRef, `TeacherData/${uid}`);

    onValue(TeacherDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const myData = snapshot.val();
        setTeacherData(myData);
        console.log('teacher is : ', myData.ID);
      } else {
        console.log("No data available");
      }
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const formattedDate = formatDate(selectedDate);
      console.log('class',teacherData.class,"date:",formattedDate)
      const classAttendanceRef = ref(getDatabase(), `AttendanceRecord/StudentAttendance/${teacherData.class}/${formattedDate}`);
      const snapshot = await get(classAttendanceRef);
     
      const data = snapshot.val();
      console.log('data',snapshot)

      if (data) {
        const attendanceArray = Object.values(data);
        setAttendanceData(attendanceArray);
       setIsLoading(false);
        setNoRecordMessage('');
      } else {
        setAttendanceData([]);
        setIsLoading(false);
        setNoRecordMessage('No record found for the selected date.');
      }
    };

    fetchData();
  }, [selectedDate, teacherData]); // Include teacherData in the dependency array

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.studentRow}>
      <Text style={styles.column}>{item.firstName +'  '+ item.lastName}</Text>
      <Text style={styles.column}>{item.attendanceStatus}</Text>
      {/* Add other columns as needed */}
    </View>
  );

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}
  
  start={{ x: 1, y: 2 }}
  end={{ x: 3, y: 1 }}
  style={styles.container}
  
    >
      <HeaderTop />

      <View style={styles.myAttendanceHeadingContainer}>
         <Text style={styles.myAttendanceTitle}>Student Attendance</Text>
         </View>
       
   
       <View style={styles.externalListConatiner}>
     
      <View style={styles.tableHeader}>
        <Text style={styles.headerColumn}>Name</Text>
        <Text style={styles.headerColumn}>Attendance Status</Text>
        {/* Add other column headers as needed */}
      </View>
      {isLoading ? (
          <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue"  />
        </View>
      ) : (
        <>
      <View >
      {noRecordMessage ? (
        <Text style={styles.noRecordMessage}>{noRecordMessage}</Text>
      ) : 
      (
        
        <FlatList
          data={attendanceData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
         
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
    </View>
    </>  
)}
    </View>
    
    <TouchableHighlight
        style={styles.selectDateButton}
        underlayColor="#054f96"
        onPress={showDatepicker}
      >
        <Text style={styles.selectDateButtonText}>Select Date</Text>
      </TouchableHighlight>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
 
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
    
      justifyContent: 'center',
      alignItems: 'center',
      height: 60,
     marginTop:-21,
     marginLeft:-20,
     marginRight:-20,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
  },
  headerText: {
    color: 'white', // White color for the header text
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  myAttendanceHeadingContainer:{
  
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop: 6,
    width: '104.7%',
    alignSelf: 'center',
  
  },
  studentRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
    marginTop: -7,
    zIndex:-1,
    marginBottom:1,
    marginTop:1,
   
  },

  myAttendanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'white',
  
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  externalListConatiner: {
    borderWidth: 1,
    height:620,
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius:0,
    borderTopLeftRadius:0,
    margin: -8,
    marginTop: -9,
    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
  marginLeft:-1.4,
  marginRight:-1,
   marginTop:0,
    flexDirection: 'row',
    paddingVertical: 8,
    
  
   
    justifyContent: 'space-between',
  
  },

  headerColumn: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    
  },

  column: {
    flex: 1,
    textAlign: 'center',
  },
  noRecordMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  selectDateButton: {
    backgroundColor: '#550A35', 
    padding: 12,
    borderRadius: 15,
    marginVertical: 8,
    elevation: 6,
    width: '90%',

    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'-4%' ,
   
  },
  selectDateButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  
    
  },
});

export default ViewAttendance;
