import React, { useEffect, useState ,useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ref,
  child,
  get,
  getDatabase,
  onValue,
  set,
  update
} from 'firebase/database';
import { auth } from '../firebase/firebaseconfig';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import Home from './Home';
import SecurityAlert from '../../Services/SecurityAlert';
import ManualAttendance from './ManualAttendance';
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Ionicons';

const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText} >Teacher Account</Text>
    </View>



  )
}



const Attendance = (props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [userUid, setUserUid] = useState('');
  const [cl, setCl] = useState('');
  const [students, setStudents] = useState([]);
  const [isStudentsLoaded, setIsStudentsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [location, setLocation] = useState(false);
  const [currentDate, setCurrentDate] = useState();
  const [teacherData, setTeacherData] = useState({})
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [ScannedIds, setMatchedScannedIds] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSavingMessage ,setAttendanceSavingMessage ] = useState();




  let counter = 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Perform your data fetching logic here
    // For example, you can call the getClass function again
    getClass(userUid);

    // Reset the refreshing state after data is fetched
    setRefreshing(false);
  }, [userUid]);



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
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    getCurrentDate()

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check internet connection and load data
    if (isConnected) {
      getUID();
    } else {
      setIsLoading(false);
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.'
      );
    }
  }, [isConnected]);

  useEffect(() => {
    // Initialize attendance object with all students as absent
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

        setUserUid(CardID);
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
        console.log('No data available');
      }
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

            const student = {
              id,
              firstName,
              lastName,
              cnic
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
    // setCurrentDate(getCurrentDate());

    const matchingStudentsSet = new Set();
    console.log("currentDate :" + currentDate)

    const dbRef = ref(getDatabase());
    const authorizedCardScansRef = child(dbRef, 'Authorized Card Scanned/' + currentDate)
    console.log(authorizedCardScansRef);

    get(authorizedCardScansRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((cardScanSnapshot) => {
            console.log('Card Scan Snapshot:', cardScanSnapshot.val());

            const cardID = cardScanSnapshot.child('cardID').val();
            console.log('Data is :', cardScanSnapshot.val().cardID);

            const matchingStudent = students.find((student) =>
              String(cardID) === String(student.id)
            );

            if (matchingStudent) {
              matchingStudentsSet.add(matchingStudent.id);
            }
          });

          const matchingStudentsList = [...matchingStudentsSet];
          console.log('Matching Students:', matchingStudentsList);
          setMatchingStudents(matchingStudentsList);
        }
        else {
          setMatchingStudents([])

        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [students, currentDate]);


  const getScannedStudentsInfo = () => {
    const ScannedStudents = students.filter((student) => matchingStudents.includes(student.id));
    setMatchedScannedIds(ScannedStudents);

    console.log(ScannedIds)

  };


  useEffect(() => {
    getScannedStudentsInfo();
  }, [matchingStudents, students]);




  // Function to get the current date in the format "DD-MM-YYYY"
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    setCurrentDate(formattedDate)
  };


  const toggleAttendance = (studentId) => {

    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: !prevAttendance[studentId],
    }));
  };
  const saveAttendance = async () => {

    setIsSavingAttendance(true);
    setAttendanceSavingMessage('Saving Attendance ...')
    // Request location permission
    console.log(polygonCoordinates)

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
              insertAttendance()
            } else {
              console.log('User location is NOT inside the polygon');
              setIsSavingAttendance(false);
            }
          },
          (error) => {
            console.log(error);
            setIsSavingAttendance(false);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );



      }
    });
    // console.log(location);



    // Check if permission was granted or denied
    // If granted, you can proceed to save attendance based on the location
    // If denied, you can handle it as needed
  };

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
    const checkedItems = ScannedIds
      .filter((student) => attendance[student.id])
      .map((checkedStudent) => ({
        id: checkedStudent.id,
        firstName: checkedStudent.firstName,
        lastName: checkedStudent.lastName,
        type: 'Not ',
        date: currentDate,
        time: time,
        fathercnic: checkedStudent.cnic,


      }));

    console.log("Checked Items :" + JSON.stringify(checkedItems))



    const absentItems = students
      .filter((student) => !checkedItems.some((item) => item.id === student.id))
      .map((absentStudent) => ({
        id: absentStudent.id,
        firstName: absentStudent.firstName,
        lastName: absentStudent.lastName,
        date: currentDate,
        time: time,
        cnic: absentStudent.cnic,
        class: cl,

      }));


    const scannedCardAbsentStudnet = ScannedIds
      .filter((student) => !checkedItems.some((item) => item.id === student.id))
      .map((absentStudent) => ({
        id: absentStudent.id,
        firstName: absentStudent.firstName,
        lastName: absentStudent.lastName,
        date: currentDate,
        time: time,
        cnic: absentStudent.cnic,
        class: cl,

      }));



    console.log("Scanned Card Absent Studnet :" + JSON.stringify(scannedCardAbsentStudnet))
    console.log("Only Absent Students : " + JSON.stringify(absentItems))


    if (absentItems.length === 0) {
      console.log('No students absent.');


    } else {
      if(currentDate == date){
      SecurityAlert.AbsentStudentsData(absentItems ,scannedCardAbsentStudnet )
      }
    }





    const allStudentsData = {};


    students.forEach((student) => {
     
      if(markWithOutLeaveStudentAttendance(student.id) != 'Leave'){
    
      allStudentsData[student.id] = {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        attendanceStatus: checkedItems.some((item) => item.id === student.id) ? 'Present' : 'Absent',

        date: currentDate,
        time: time,
        class: cl,
        teachername: teacherData.firstname + " " + teacherData.lastname,
        fathercnic: student.cnic,

      };
    }
  
    });

    

    console.log("Formatted:" + JSON.stringify(allStudentsData))






    const formattedScannedCardAbsentStudents = {};
    scannedCardAbsentStudnet.forEach(student => {
      formattedScannedCardAbsentStudents[student.id] = student;
    });
  







    // Firebase database reference
    const dbRef = ref(getDatabase());

    // Generate a unique key using push
    const newStudentAttendanceRef = child(dbRef, `AttendanceRecord/StudentAttendance/` + cl + "/" + currentDate);
    const newTeacherAttendanceRef = child(dbRef, `AttendanceRecord/TeachersAttendance/` + currentDate + "/" + teacherData.uid + "/");
    const scannedcardAbsentRef = child(dbRef, `ScanCardAbsentStudents/${currentDate}/`);
    

    try {
      // Set the data at the generated key
      update(newStudentAttendanceRef, allStudentsData);

      if(currentDate == date )
      {

        update(newTeacherAttendanceRef, {
          id: teacherData.ID,
          name: teacherData.firstname + " " + teacherData.lastname,
          class: cl,
          date: currentDate,
          time: time,
          isTeacher: 'yes',
          attendanceStatus: 'present',
          uid: teacherData.uid
  
        })

      }
      if(checkTeacherAttendance() != 'Data found' && currentDate != date ){
        
        update(newTeacherAttendanceRef, {
          id: teacherData.ID,
          name: teacherData.firstname + " " + teacherData.lastname,
          class: cl,
          date: currentDate,
          time: time,
          isTeacher: 'yes',
          attendanceStatus: 'absent',
          uid: teacherData.uid
  
        })
      }

     
      update(scannedcardAbsentRef, formattedScannedCardAbsentStudents);
      

      // Log the success message
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

  const checkTeacherAttendance = ()=>{
 
    const dbRef = ref(getDatabase());
    const attendanceRef = child(dbRef, `AttendanceRecord/TeachersAttendance/${currentDate}/${teacherData.uid}/`);
    
    var status = '';

    onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        status = 'Data found'
      } else {
        console.log('No data available current on selected date');
      }
    });

   return status
  } 






  const renderStudentItem = ({ item }) => {

    counter++;// to increase serial number during each render

    return (


      <TouchableOpacity style={styles.studentItem} onPress={() => toggleAttendance(item.id)}>
        <Text style={styles.studentNumber}>{counter}</Text>
        <Text style={styles.id}>{item.id}</Text>
        <Text style={styles.name}> {item.firstName} {item.lastName}</Text>

        {/* Checkbox to mark attendance */}

        <View style={styles.checkbox}>
          {attendance[item.id] ? (
            <View style={styles.checkedBox} />
          ) : (
            <View style={styles.uncheckedBox} />
          )}
        </View>
      </TouchableOpacity>

    );
  };

  return (
    <LinearGradient
      colors={['#FFFAF0', '#FFFAF0']}

      start={{ x: 1, y: 2 }}
      end={{ x: 3, y: 1 }}
      style={styles.container}>
      <HeaderTop />

      {isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View style={styles.classHeadingContainer}>
          <Text style={styles.classText}>Class: {cl}</Text>
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Date and Time: {new Date().toLocaleString()}
          </Text>

        </View>
      )}

      <View style={styles.externalListConatiner}>
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



        {isStudentsLoaded ? (
          matchingStudents.length > 0 ? (
            <FlatList
              data={matchingStudents}
              keyExtractor={(item) => item}
              renderItem={(item) => {
                const student = students.find((s) => s.id === item.item);

                if (student) {
                  return renderStudentItem({ item: student });
                } else {
                  return null;
                }
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />

          ) : (
            <Text style={styles.NotScannedCards}>
              No authorized card scans found matching students.
            </Text>
          )
        ) : (
          <Text style={{ color: 'white' }}>Loading...</Text>
        )}
      </View>



      <View style={styles.ButtonContainer}>
        <TouchableOpacity onPress={saveAttendance}>
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Attendance</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => props.navigation.navigate('Manual Attendance')}>
          <View style={styles.manualButton}>
            <Text style={styles.manualButtonText}>Manual Attendance</Text>
          </View>
        </TouchableOpacity>
      </View>
      {isSavingAttendance && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#7D0552" />
            {attendanceSavingMessage ? <Text style={{ color: 'black' }}>{attendanceSavingMessage}</Text> : null}
          </View>
        )}

    </LinearGradient>

  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',

    backgroundColor: '#0A2558',

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
  classHeadingContainer: {
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
  NotScannedCards: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    marginLeft: -1.3,
    marginRight: -1.3,
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
  studentNumber: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
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
  ButtonContainer:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,


  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 6,
    marginLeft: 10,
    width: '100%',
    paddingRight: 20,
    paddingLeftt: 1,


  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  manualButton: {
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 16,

    width: '95%',

  },
  manualButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
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
export default Attendance;
