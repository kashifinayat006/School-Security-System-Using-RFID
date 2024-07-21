import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ref, getDatabase, onValue, update, child ,set } from 'firebase/database';
import { auth } from '../firebase/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
const LeaveRequests = (props) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cl, setCl] = useState('');
  const [teacherData , setTeacherData] = useState({})

  const HeaderTop = () => {
    return (
      <View style={styles.headerTop}>
        <Text style={styles.headerText}>Teacher Account</Text>
      </View>
    );
  }

  useEffect(() => {  
      getUID();
  }, []);



  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID } = session;
        console.log(CardID)
       
        getClass(CardID);
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
     
    }
  };


  function getClass(uid) {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `TeacherData/${uid}/class`);
    const TeacherDataRef = child(dbRef, `TeacherData/${uid}`);

    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        const myclass = snapshot.val();
        setCl(myclass);
        console.log(myclass)
        
      } else {
        console.log("No data available");
      }
    });

    onValue(TeacherDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const myData = snapshot.val();
        setTeacherData(myData);
        console.log('teacher is : ',teacherData.ID)
        
      } else {
        console.log("No data available");
      }

     
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classValue = cl // Set the class value you want to filter
        const dbRef = ref(getDatabase(), 'StudentsLeaveRequests');

        onValue(dbRef, (snapshot) => {
          if (snapshot.exists()) {
            const dates = snapshot.val();
            const leaveRequestsArray = [];

            Object.keys(dates).forEach((dateKey) => {
              const users = dates[dateKey];

              Object.keys(users).forEach((userId) => {
                const request = users[userId];

                if (request.class === classValue && request.status === 'pending') {
                  leaveRequestsArray.push({
                    id: userId,
                    uid: dateKey,
                    ...request,
                  });
                }
              });
            });

            setLeaveRequests(leaveRequestsArray);
            console.log(leaveRequests)
          } else {
            setLeaveRequests([]);
            
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [cl]);


  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const handleAction = async (id, status, uid, name, otherFields) => {
    try {
      const db = getDatabase();
      const leaveRequestsRef = ref(db, 'StudentsLeaveRequests');
      const attendanceRecordRef = ref(db, 'AttendanceRecord/StudentAttendance/');
       

      console.log(otherFields.childID,'Name',otherFields.Name)
      // // Update the status for the specific leave request along with the date
      await update(child(leaveRequestsRef, `/${uid}/${id}`), {
        status: status,
      });

      if (status === 'accepted') {
        // Insert data into the AttendanceRecord path
        if (otherFields.startDate && otherFields.endDate) {
          // Parse 'DD-MM-YYYY' formatted dates
          const startDate = parseDate(otherFields.startDate);
          const endDate = parseDate(otherFields.endDate);

          // If there's a start date and end date, calculate all dates in the range
          const currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const formattedDate = formatDate(currentDate); // Format date as 'DD-MM-YYYY'
            const attendanceData = {
              firstName : otherFields.firstName,
              lastName : otherFields.lastName,
              class: otherFields.class,
              date : formattedDate,
              id: otherFields.childID,
              attendanceStatus : 'Leave',
              parentID: otherFields.parentID,
              parentName : otherFields.parentName,
              parentCNIC : otherFields.parentCNIC,
              // Add other fields as needed
              // For example: name, reason, etc.
              // ...
            };

            console.log(formattedDate)

            await update(child(attendanceRecordRef, `${otherFields.class}/${formattedDate}/${otherFields.childID}`), attendanceData);

            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
          }
        } else if (otherFields.isSingleDay) {
          // If it's a single-day leave, insert one record
          console.log(otherFields.isSingleDay)
          const attendanceData = {
            firstName : otherFields.firstName,
            lastName : otherFields.lastName,
            class: otherFields.class,
            attendanceStatus : 'Leave',
            date : otherFields.isSingleDay,
            id : otherFields.childID,
            parentName : otherFields.parentName,
            parentID : otherFields.parentID,
            parentCNIC : otherFields.parentCNIC

           
          };

          await update(child(attendanceRecordRef, `${otherFields.class}/${otherFields.isSingleDay}/${otherFields.childID}`), attendanceData);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  

  const renderItem = ({ item }) => (
    <>
    

    <View style={styles.requestContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{item.firstName+''+ item.lastName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Apply Date:</Text>
          <Text style={styles.value}>{item.applyDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{item.reason}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Single day:</Text>
          <Text style={styles.value}>{item.isSingleDay}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Start date:</Text>
          <Text style={styles.value}>{item.startDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>End date:</Text>
          <Text style={styles.value}>{item.endDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{item.status}</Text>
        </View>

        {/* Accept and Reject buttons */}
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAction(item.id, 'accepted', item.uid, item.Name, item)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleAction(item.id, 'rejected', item.uid, item.Name, item)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View></>
  );

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}
  
  start={{ x: 1, y: 2 }}
  end={{ x: 3, y: 1 }}
  style={styles.container}
  
    >
      <HeaderTop />
      <View style={styles.myAttendanceHeadingContainer}>
      <Text style={styles.myAttendanceTitle}>Student Leave Requests</Text>
    </View>
    <View style={styles.externalListConatiner}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loadingStyle} />
      ) : (
        <FlatList
          data={leaveRequests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
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
       // Negative margin to extend on the right
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
    padding: 6, // Increased padding for better visual balance
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop:4,
    width: '102.7%', // Increased width to 80% for a wider appearance
    alignSelf: 'center',
  
  },
  myAttendanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'white',
  
  },
  externalListConatiner: {
    borderWidth: 1,
    height:640,
    borderColor: 'grey',
    borderRadius: 19,
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
    margin: -8,
    marginTop: 0,
    marginLeft:-4,
    marginRight:-4,
    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  flatListContainer: {
    padding: 20,
  },
  requestContainer: {
    marginBottom: 20,
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    marginLeft: 79,
    marginRight:32,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
  },
  loadingStyle:{
     flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default LeaveRequests;