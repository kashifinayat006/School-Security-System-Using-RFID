import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ref, getDatabase ,get } from 'firebase/database';
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Parent Account</Text>
    </View>
  );
}

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [noRecordMessage, setNoRecordMessage] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [cnic ,setCnic ] = useState('');



  const getUID = async () => {
    
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID, cnic } = session;
        setCnic(cnic)
        fetchData(cnic);
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }

    
  };


  useEffect(() => {
    
    getUID()
    
  }, [cnic ,selectedDate]);

  const fetchData = async (fatherCnicToMatch) => {
    setNoRecordMessage('');
    const formattedDate = formatDate(selectedDate);


    const classAttendanceRef = ref(getDatabase(), `AttendanceRecord/StudentAttendance/`);

    try {
      const snapshot = await get(classAttendanceRef);
      if (snapshot.exists()) {
        const allClasses = snapshot.val();
        const matchingStudents = [];

        for (const classKey in allClasses) {
          const classData = allClasses[classKey];

          if (classData[formattedDate]) {
            const idData = classData[formattedDate];

            for (const studentId in idData) {
              const studentData = idData[studentId];

              if (studentData.fathercnic === fatherCnicToMatch) {
                const matchingStudent = {
                  class: classKey,
                  date: formattedDate,
                  id: studentId,
                  ...studentData,
                };

                matchingStudents.push(matchingStudent);
              }
            }
          }
        }

       

        if (matchingStudents.length > 0) {
         
          setAttendanceData(matchingStudents);
          console.log("Final Data:", JSON.stringify(matchingStudents));
          setIsDataLoaded(true);
        } else {
          setNoRecordMessage("No attendance records found for the selected date.");
         
      
        }
      } else {
        setNoRecordMessage("No attendance records found for the selected date.");
     
    
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.column}>{item.firstName} {item.lastName}</Text>
      <Text style={styles.column}>{item.attendanceStatus}</Text>
    </View>
  );



  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
   
    setShowDatePicker(false);
    if (date) {
      
      setSelectedDate(date);
    
      

    }
  };

  const GradientButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={['#550A35', '#7D0552']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#FFFAF0', '#FFFAF0']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <HeaderTop />

      <View style={styles.myChildAttendanceHeadingContainer}>
        <Text style={styles.modalTitle}>My Children Attendance</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerColumn}>Name</Text>
        <Text style={styles.headerColumn}>Attendance Status</Text>
      </View>

      <View style={styles.externalListConatiner}>
        
        {isDataLoaded && !noRecordMessage ? (
          <FlatList
            data={attendanceData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          
          />
        ) : (
          <Text style={styles.noRecordMessage}>{noRecordMessage}</Text>
        )}
      </View>

      <GradientButton title="Select Date" onPress={showDatepicker} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
    backgroundColor: '#550A35', 
   
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginTop: -21,
    marginLeft: -20,
    marginRight: -20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerText: {
    color: 'white', 
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  myChildAttendanceHeadingContainer: {



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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',

  },
  externalListConatiner: {
    borderWidth: 1,
    height: "80%",
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    margin: -8,
  
    backgroundColor: 'lightgrey', 
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#054f96',
    marginBottom: 10,
    marginLeft: -8.18,
    marginRight: -8.18,
    zIndex: 100,
  },
  headerColumn: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color:'white'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  column: {
    flex: 1,
    textAlign: 'center',
  },

  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  button: {
    marginTop: -10,
    padding: 10,
    borderRadius: 15,
    marginRight: 20,
    marginLeft: 20,
    
  },
  noRecordMessage: {
    textAlign: 'center',
    marginTop: 70,
    fontSize: 16,
    color: 'gray',
  },
});

export default ViewAttendance;
