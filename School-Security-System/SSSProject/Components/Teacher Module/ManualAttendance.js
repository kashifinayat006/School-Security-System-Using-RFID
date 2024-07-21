import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, PermissionsAndroid, Alert, ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { ref, child, get, getDatabase, onValue, push, set, update } from "firebase/database";
import Geolocation from '@react-native-community/geolocation';
import { checkActionCode } from 'firebase/auth';
import ManaualAttendanceAlert from '../../Services/ManaualAttendanceAlert';
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Ionicons';
const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText} >Manual Attendance</Text>
    </View>
  )
}
const ManualAttendance = (props) => {
  const [notScannedIds, setNotScannedIds] = useState([]);
  const [cardID, setCardID] = useState('');
  const [cl, setCl] = useState('');
  const [students, setStudents] = useState([]);
  const [isStudentsLoaded, setIsStudentsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [teacherData, setTeacherData] = useState({})
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSavingMessage ,setAttendanceSavingMessage ] = useState();

  var counter = 0;


  useEffect(() => {
    // Fetch polygon coordinates from Firebase
    const dbRef = ref(getDatabase());
    const polygonRef = child(dbRef, 'polygons/coordinates');

    get(polygonRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const coordinatesArray = [];
          snapshot.forEach((coordSnapshot) => {
            const lat = coordSnapshot.child('lat').val();
            const lng = coordSnapshot.child('lng').val();
            coordinatesArray.push({ latitude: lat, longitude: lng });
          });
          setPolygonCoordinates(coordinatesArray);
          console.log('Polygon Coordinates:', coordinatesArray);
        }
      })
      .catch((error) => {
        console.error('Error fetching polygon coordinates:', error);
      });
  }, []);

  const saveManualAttendance = () => {
    setIsSavingAttendance(true);
    setAttendanceSavingMessage('Saving Attendance ...')

    setSavingAttendance(true);
    const result = requestLocationPermission();
    result.then(res => {
      console.log('res is:', res);
      if (res) {

        const polygon = polygonCoordinates;

        // Define the polygon coordinates as an array of objects
        // const polygon = [
        //   { latitude: 34.201726, longitude: 73.238769 },
        //   { latitude: 34.199153, longitude: 73.237886 },
        //   { latitude: 34.198226, longitude: 73.241892 },
        //   { latitude: 34.200642, longitude: 73.243049 },
        // ];


        // Check if a point is inside a polygon
        function isPointInPolygon(point, polygon) {
          let x = point.latitude,
            y = point.longitude;

          let inside = false;
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i].latitude,
              yi = polygon[i].longitude;
            let xj = polygon[j].latitude,
              yj = polygon[j].longitude;

            let intersect =
              yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
          }

          return inside;
        }

        // Get the user's location using Geolocation
        Geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            // Check if the user's location is inside the polygon
            const isInside = isPointInPolygon(userLocation, polygon);

            if (isInside) {
              console.log('User location is inside the polygon');
              insertAttendance();
            } else {
              console.log('User location is NOT inside the polygon');
              setIsSavingAttendance(false)
              alert('You are not inside the School premisis Please Goto School and than mark the Attendance')
            }
          },
          (error) => {
            console.log(error.message);
            setIsSavingAttendance(false)

            if (error.message == 'No location provider available.') {
              setIsSavingAttendance(false)
              alert('Please turn on your mobile location.')

            }
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );



      }
    });

  };


  // Function Insert Manual Attendance
  function insertAttendance() {
   


    const currentDateAndTime = new Date();

    const currentYear = currentDateAndTime.getFullYear();
    const currentMonth = (currentDateAndTime.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDateAndTime.getDate().toString().padStart(2, '0');
    
    const currentHour = currentDateAndTime.getHours();
    const currentMinute = currentDateAndTime.getMinutes().toString().padStart(2, '0');
    const currentSecond = currentDateAndTime.getSeconds();
    
    // Determine if it's AM or PM
    const amPM = currentHour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const formattedHour = (currentHour % 12 || 12).toString().padStart(2, '0');
    
    const date = currentDay + '-' + currentMonth + '-' + currentYear;
    const time = formattedHour + ':' + currentMinute + ' ' + amPM;

    const checkedItems = notScannedIds.reduce((result, student) => {
      if(markWithOutLeaveStudentAttendance(student.id) != 'Leave'){
      if (attendance[student.id]) {
        result[student.id] = {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          type: 'Manual',
          date: currentDate,
          time: time,
          teachername: teacherData.firstname + ' ' + teacherData.lastname,
          fathercnic: student.cnic,
          attendanceStatus: 'Present',
          class : cl,
        };
      }
    }
    
      return result;
    }, {});

      

      const manaualAttendanceRecord = notScannedIds
      .filter((student) => attendance[student.id])
      .map((checkedStudent) => ({
        id: checkedStudent.id,
        firstName: checkedStudent.firstName,
        lastName: checkedStudent.lastName,
        type : 'Manual',
        date: currentDate,
        time : time,
        teachername: teacherData.firstname + ' ' + teacherData.lastname,
        fathercnic: checkedStudent.cnic,
        class : cl
        
      }));
      

      ManaualAttendanceAlert.ManaualAttendanceStudentData(manaualAttendanceRecord)

      

    const allStudentsData = {};

    students.forEach((student) => {
      allStudentsData[student.id] = {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        // attendanceStatus: checkedItems.some((item) => item.id === student.id) ? 'Present' : 'Absent',
        type: 'Manual',
        date: date,
        time: currentDate,
        class: cl,
        teachername: teacherData.firstname + " " + teacherData.lastname,
        fathercnic: student.cnic,

      };
    });

   

    
    const formattedcheckedItem = {};
Object.keys(checkedItems).forEach(studentId => {
  const student = checkedItems[studentId];
  formattedcheckedItem[student.id] = {
    id: student.id,
    inTime: time,
    fathercnic: student.fathercnic,
    firstName: student.firstName,
    lastName: student.lastName,
  };
});









    // Firebase database reference
    const dbRef = ref(getDatabase());

    // Generate a unique key using push
    const newStudentAttendanceRef = child(dbRef, `AttendanceRecord/StudentAttendance/` + cl + "/" + currentDate);
    const newInTimeRef = child(dbRef, `AllStudentsInOutTime/${currentDate}/`);
    try {
      // Set the data at the generated key
      update(newStudentAttendanceRef, checkedItems);
      update(newInTimeRef,formattedcheckedItem);
     
      console.log('Attendance records saved successfully.');
      alert('Attendance record saved Successfully');
      props.navigation.navigate('teacherDashboard')
    } catch (error) {
      // Log the error if saving fails
      console.error('Error saving attendance records:', error);
    }
    finally {
      // Set loading state to false when the save process is complete (whether successful or not)
      setSavingAttendance(false);
      setIsSavingAttendance(false);
    }

  }

  const markWithOutLeaveStudentAttendance = (id)=>{

    const dbRef = ref(getDatabase());
    const attendanceRef = child(dbRef, `AttendanceRecord/StudentAttendance/${cl}/${currentDate}/${id}`);
    
    var status = '';
    onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // console.log('Enternal :' ,data.attendanceStatus)
        status =  data.attendanceStatus;

      } else {
        console.log('No data available');
        
      }
    });

    return status

  }


  // Function to request location permission
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    getCurrentDate()

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      getUID();
    } else {
      setIsLoading(false);
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
    }
  }, [isConnected]);

  useEffect(() => {
    const initialAttendance = {};
    students.forEach((student) => {
      initialAttendance[student.id] = false;
    });
    setAttendance(initialAttendance);
  }, [students]);

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID } = session;

        setCardID(CardID);
        getClass(CardID);
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
      setIsLoading(false);
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
        displayStudents(myclass);
      } else {
        console.log("No data available");
      }

      setIsLoading(false);
    });

    onValue(TeacherDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const myData = snapshot.val();
        setTeacherData(myData);
        console.log('teacher is : ', teacherData.ID)

      } else {
        console.log("No data available");
      }

      setIsLoading(false);
    });
  }
  // Function to toggle student attendance
  const toggleAttendance = (studentId) => {

    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: !prevAttendance[studentId],
    }));
  };
  function displayStudents(cl) {
    const dbRef = ref(getDatabase());

    get(child(dbRef, `ClassRoom/${cl}/Students/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const studentList = [];

          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const id = data.ID;
            const firstName = data.firstName;
            const lastName = data.lastName;
            const cnic = data.cnic;

            console.log('faTHER CNIC : ', cnic)
            const student = {
              id,
              firstName,
              lastName,
              cnic,
            };
            studentList.push(student);
          });

          setStudents(studentList);
          setIsStudentsLoaded(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {

    
    const matchingStudentsSet = new Set();
    const dbRef = ref(getDatabase());
    const authorizedCardScansRef = child(dbRef, 'Authorized Card Scanned/'+currentDate);

    get(authorizedCardScansRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((dateSnapshot) => {
            const cardIDValue = dateSnapshot.child('cardID').val();

            const currentMatchingStudents = students.filter((student) =>
              cardIDValue.includes(student.id),
              
            );

            currentMatchingStudents.forEach((student) => {
              matchingStudentsSet.add(student.id);
            });
          });

          const matchingStudentsList = [...matchingStudentsSet];

          setMatchingStudents(matchingStudentsList);
          setIsLoading(false);
         
        }
        else{
          setMatchingStudents([]);
          setIsLoading(false);
          
        }
      })
      .catch((error) => {
        console.error(error);
      });
      
  }, [students, currentDate]);

  const getNotScannedStudentsInfo = () => {

    const notScannedStudents = students.filter((student) => !matchingStudents.includes(student.id));
    setNotScannedIds(notScannedStudents);
    


  };


  useEffect(() => {
    getNotScannedStudentsInfo();
  }, [matchingStudents, students]);

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
    const year = today.getFullYear();
  
    const formattedDate = `${day}-${month}-${year}`;
    setCurrentDate(formattedDate);
  };

  return (

    <View style={styles.container}>
  
    <HeaderTop/>
    {isLoading && notScannedIds.length > matchingStudents.length && notScannedIds.length < matchingStudents.length ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    ) : (
      <>

  
        <View style={styles.myLeaveDataContainer}>
          <Text style={styles.classText}>Class: {cl}</Text>
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Date and Time: {new Date().toLocaleString()}
          </Text>
        </View>

        <View style={[styles.externalListConatiner]}>
        <View style={styles.datePickerContainer}>
          <Text style={{ color: 'black', marginTop: 10 }}>Select Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectDateButton}>
            <Text style={{ color: 'white', }}>
              {currentDate}
            </Text>
            <Icon name="calendar" size={20} color="white" style={{ marginLeft: 100 }} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(
                parseInt(currentDate.split('-')[2]), // Year
                parseInt(currentDate.split('-')[1]) - 1, // Month (subtract 1 because months are 0-indexed)
                parseInt(currentDate.split('-')[0]) // Day
              )}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                // Handle the selected date
                if (event.type === 'set' && selectedDate) {
                  const day = selectedDate.getDate().toString().padStart(2, '0');
                  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                  const year = selectedDate.getFullYear();
                  const formattedDate = `${day}-${month}-${year}`;
                  setCurrentDate(formattedDate);
                }
              }}
            />
          )}
        </View>
          <View>
            {isStudentsLoaded ? (
              <>
                {notScannedIds.length > 0 && (
                  <>
                    <Text style={styles.NotScannedCards}>
                      Not Scanned Students:
                    </Text>
                    <FlatList
                      data={notScannedIds}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.studentItem}
                          onPress={() => toggleAttendance(item.id)}
                        >
                          <Text style={styles.studentNumber}>
                            {counter = counter + 1}
                          </Text>
                          <Text style={styles.id}>{item.id}</Text>
                          <Text style={styles.name}>
                            {item.firstName} {item.lastName}
                          </Text>
                          <View style={styles.checkbox}>
                            {attendance[item.id] ? (
                              <View style={styles.checkedBox} />
                            ) : (
                              <View style={styles.uncheckedBox} />
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </>
                )}
              </>
            ) : (
              <Text style={{ color: 'white' }}>Loading...</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity onPress={saveManualAttendance}>
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Attendance</Text>
          </View>
          
        </TouchableOpacity>

        {isSavingAttendance && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#7D0552" />
            {attendanceSavingMessage ? <Text style={{ color: 'black' }}>{attendanceSavingMessage}</Text> : null}
          </View>
        )}
      </>
      
    )}
    
  </View>
  );
};

// Function to request location permission




const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',

    backgroundColor:'#FFFAF0',
  },
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
    // Negative margin to extend on the right
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
    color: 'white', // White color for the header text
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  myLeaveDataContainer: {

    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, // Increased padding for better visual balance
    borderTopLeftRadius: 25,
    borderTopRightRadius: 15,
    color: 'white',
    textAlign: 'center',
    marginTop: 6,
    width: '104.7%', // Increased width to 80% for a wider appearance
    alignSelf: 'center',

  },
  externalListConatiner: {
    borderWidth: 1,
    borderTopWidth: 0,
    height: 590,
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    margin: -8,
    marginTop: -9,

    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  leaveItem: {
    marginVertical: 10,
  },

  NotScannedCards: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    marginLeft: -1.38,
    marginRight: -0.5,
    marginTop: 0,
  },

  classText: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  studentItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 362.3,
    marginLeft: -2,
    marginBottom: 3,
    // marginBottom: 3,


  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    width: 15,
    height: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  uncheckedBox: {
    width: 15,
    height: 15,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  id: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginRight: 8
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility:'hidden',
    marginTop:250
    
  },

  datePickerContainer: {
    alignItems: 'center',
    marginTop: 10,
    
  },
  selectDateButton: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width:'60%'
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});

export default ManualAttendance;