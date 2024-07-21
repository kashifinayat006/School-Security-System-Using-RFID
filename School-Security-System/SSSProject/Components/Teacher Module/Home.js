import React,{useState} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet ,Image ,RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from './CustomHeader';
import LinearGradient from 'react-native-linear-gradient';
import { ref, child, get, getDatabase, onValue } from "firebase/database";
import { auth } from '../../firebase/firebaseconfig';
import LeaveRequests from './LeaveRequests';
import StudentTable from './StudentTable';


function getClass(uid) {
  const dbRef = ref(getDatabase());
  const classRef = child(dbRef, `TeacherData/${uid}/class`);

  // Set up a listener for real-time updates
  onValue(classRef, (snapshot) => {
    if (snapshot.exists()) {
      const myclass = snapshot.val();
      setCl(myclass);

      // Call displayStudents with the class information
      displayStudents(myclass);
    } else {
      console.log("No data available");
    }

    setIsLoading(false); // Stop loading when data is fetched
  });
}
function displayStudents(cl) {
    var index = 0;
    const dbRef = ref(getDatabase());

    get(child(dbRef, `ClassRoom/${cl}/Students/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const studentList = [];

          snapshot.forEach((childSnapshot) => {
            index=index+1;
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
          });

          // Update the state with the student data
          setStudents(studentList);
          setIsStudentsLoaded(true); // Mark students as loaded
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }







  


  const  HeaderTop =  () =>
  {
    return(
      <View style={styles.headerTop}>
<Text style={styles.headerText} >Teacher Account</Text>
</View>
        
       
  
    )
  }




 



  
const Home = (props) => {
  const [students, setStudents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const modules = [
    { id : '1', name: 'Mark Attendance',onPress :handleAttendance, icon: 'person'  },
   
    { id : '2', name: 'Apply New Card',onPress: handleNewCard, icon: 'add-box' },
    { id : '3', name: 'View Students Attendance',onPress: ViewAttendance, icon: 'add-box' },
    { id : '4', name: 'My Attendance',onPress: CheckTeacherAttendance, icon: 'add-box' },
    { id : '5', name: 'Apply Leave',onPress: ApplyLeave, icon: 'add-box' },
    { id : '6', name: 'Students Leave',onPress: LeaveRequests, icon: 'add-box' },
    

  ];
  function handleAttendance (){
   
    props.navigation.navigate('teacherAttendance')
  }
  function handleLeave (){
    
    props.navigation.navigate('teacherStudentTable')
  
  }
  function handleNewCard (){
    props.navigation.navigate('teacherNewCard')
  }

  function ViewAttendance(){
    props.navigation.navigate('View Attendance')

  }

  function CheckTeacherAttendance(){
    props.navigation.navigate('CheckTeacherAttendance')

  }

  function ApplyLeave()
  {
    props.navigation.navigate('ApplyLeave')

  }

  function LeaveRequests(){
    props.navigation.navigate('LeaveRequests')
  }

  const handleRefresh = () => {
    setRefreshing(true);
    
    setTimeout(() => {
      // Perform the refresh logic here (e.g., fetchData())
      
      setRefreshing(false);
    }, 1000);
  };




  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        ...styles.moduleButton,
        backgroundColor: lightColors[item.id - 1], // Use a different color for each module
      }}
      onPress={item.onPress}
    >
      <Icon name={item.icon} size={30} color={iconColors[item.id - 1]} />
      <Text style={styles.moduleButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}
  
  start={{ x: 1, y: 2 }}
  end={{ x: 3, y: 1 }}
  style={styles.container}>
    
   
    {/* <View style={styles.container} > */}

        <HeaderTop/>
      
        <CustomHeader/>
      

      {/* <Text style={styles.headerText}>School Dashboard</Text> */}

      <View style={styles.gridContainer} >
      <FlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
       // Display three items per row
        // contentContainerStyle={styles.gridContainer}// Style for the grid container
      />
      </View>
    {/* </View> */}

    <StudentTable/>
    </LinearGradient>
   
    
  );
};
const iconColors = ['green', 'blue', 'red', 'purple', 'orange', 'grey', 'green'];
const lightColors = [ 'white', 'white',  'white','white','white', 'white', 'white'];
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
     // Negative margin to extend on the right
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width:'100%',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerText: {
    color: 'white', 
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
    paddingBottom:40,
  },
  gridContainer: {
    justifyContent: 'space-between', // Align items evenly
    flexGrow: 0,
  
    
    width:'100%',
    marginTop:3
    

    
    
   
},
moduleButton: {
  padding: 10,
  margin: 11,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  width: 85,
  height: 90,
  marginTop: 2,
  borderColor: 'grey', // Darker blue color for border
  shadowColor: 'black',
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 0.3,
  elevation: 6, 
  borderWidth: 1,
  
},

moduleButtonText: {
  color: 'black',
  fontSize: 12,
  fontWeight: 'bold',
  marginTop: 10,
  alignItems: 'center',
  textAlign:'center',
},
  
});

export default Home;
