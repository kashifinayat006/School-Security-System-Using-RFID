import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView,ActivityIndicator } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
const CheckTeacherAttendance = () => {
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [teacherLeaveAttendance, setTeacherLeaveAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const HeaderTop = () => {
    return (
      <View style={styles.headerTop}>
        <Text style={styles.headerText1}>Teacher Account</Text>
      </View>
    );
  };

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid } = session;
        console.log("Teacher asn : ",session)
        return uid;
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }
  };

 // ... (your existing code)

 useEffect(() => {
  const fetchAttendanceData = async (teacherId) => {
    try {
      setIsLoading(true);
      const database = getDatabase();
      const teacherAttendanceRef = ref(database, 'AttendanceRecord/TeachersAttendance');
      // const teacherLeaveAttendanceRef = ref(database, 'AttendanceRecord/TeachersLeaveAttendance');

      const snapshot = await get(teacherAttendanceRef);
      // const leaveAttendanceSnapshot = await get(teacherLeaveAttendanceRef);

      if (snapshot.exists()) {
        const dates = Object.keys(snapshot.val());
        setAttendanceDates(dates);

        const records = dates.flatMap((date) => {
          const dateData = snapshot.val()[date];
          const teacherData = dateData[teacherId];

          // Check if the teacher ID matches the desired ID
          if (teacherData) {
            return {
              date,
              id: teacherId,
              type: 'Attendance',
              ...teacherData,
            };
          } 
          return [];
        });
        setAttendanceRecords(records);
      } else {
        console.log('No attendance records found for the given teacher ID');
      }

      // if (leaveAttendanceSnapshot.exists()) {
      //   const leaveData = leaveAttendanceSnapshot.val();

      //   // Extract the relevant teacher data from the array
      //   const teacherLeaveData = leaveData
      //     .map((record) => record[teacherId])
      //     .filter(Boolean)
      //     .map((record) => ({
      //       date: record.date,
      //       id: teacherId,
      //       type: 'Leave',
      //       ...record,
      //     }));

      //   if (teacherLeaveData.length > 0) {
      //     // Combine attendance and leave records into a single array
      //     const combinedRecords = [...attendanceRecords, ...teacherLeaveData];
      //     setCombinedRecords(combinedRecords);
      //     console.log('Combined records', combinedRecords);
      //   } else {
      //     setCombinedRecords([]);
      //   }
      // }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  getUID().then((teacherId) => {
    fetchAttendanceData(teacherId);
  });
}, []);
// ... (your existing code)


  return (
    <View style={styles.container}>
      <HeaderTop />
      <View style={styles.myAttendanceHeadingContainer}>
         <Text style={styles.myAttendanceTitle}>My Attendance</Text>
         </View>
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Status</Text>
        <Text style={styles.headerText}>Time</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      ) : (
        <ScrollView style={styles.externalListConatiner}>
          {attendanceRecords.map((record, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.rowText}>{record.date}</Text>
              <Text style={styles.rowText}>{record.attendanceStatus}</Text>
              <Text style={styles.rowText}>{record.time}</Text>
            </View>
          ))}

          {teacherLeaveAttendance.map((leaveData, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.rowText}>{leaveData.date}</Text>
              <Text style={styles.rowText}>{leaveData.attendanceStatus}</Text>
              <Text style={styles.rowText}>{leaveData.time}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
 flex: 1,
    padding: 0,
    backgroundColor:'#FFFAF0',
  },
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
       // Negative margin to extend on the right
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
    
    
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
  },
  headerText1: {
    color: 'white', // White color for the header text
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  externalListConatiner: {
  borderWidth: 1,
  height:645,
 
  borderColor: 'black',
  borderRadius: 25,
  borderTopLeftRadius:0,
  borderTopRightRadius:0,
 marginRight:13,
 marginLeft:13,
  marginTop: 0,
  backgroundColor: 'lightgrey', // Light grey background
  shadowColor: 'black',// black color
  shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  myAttendanceHeadingContainer:{
  
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, // Increased padding for better visual balance
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop: 6,
    width: '93.75%', // Increased width to 80% for a wider appearance
    alignSelf: 'center',
    height:"6%",
  
  },
  myAttendanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'white',
  
  },
  // table: {
  //   margin: 16,
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   borderRadius: 8,
  //   overflow: 'hidden',
  //   marginLeft:12,
  //   marginRight:12,
  // },
  tableHeader: {
    borderRadius:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    height:40,
  
  
   
    fontWeight: 'bold',
    backgroundColor: '#054f96',
   
   
    color: 'white',
    textAlign: 'center',
    marginTop: 0.6,
    marginLeft:12,
    marginRight:12,
  
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color:'white',
    fontSize:17
  },
  tableRow: {
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
  rowText: {
    flex: 1,
    textAlign: 'center',
    color:'black'
  },
  loadingContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility:'hidden',
    marginTop:250
    
  },
});

export default CheckTeacherAttendance;
