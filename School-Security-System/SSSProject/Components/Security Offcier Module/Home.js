import React,{useState} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet ,Image , RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from './CustomHeader';
import LinearGradient from 'react-native-linear-gradient';
import { ref, child, get, getDatabase, onValue } from "firebase/database";
import { auth } from '../../firebase/firebaseconfig';



  


  const  HeaderTop =  () =>
  {
    return(
      <View style={styles.headerTop}>
<Text style={styles.headerText}>Security Officer Account</Text>
</View>
        
       
  
    )
  }




 



  
const Home = (props) => {
  const [students, setStudents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const modules = [
    { id : '1', name: 'Absent Student Alerts',onPress :handleAbsenceAlert, icon: 'alert'  },
    { id : '2', name: 'Unauthorized RFID Scans',onPress :handleUnathorized, icon: 'credit-card'  },
    { id : '3', name: 'Manual Attendance Records',onPress :handleManual, icon: 'credit-card'  }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    
    setRefreshing(false);
  };


  function handleAbsenceAlert (){
   
    props.navigation.navigate('SecurityAbsence')
  }
  function handleUnathorized (){
   
    props.navigation.navigate('SecurityUnathorized')
  }

  function handleManual(){
    props.navigation.navigate('ManualAttendanceRecord')


  }





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
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
       // Display three items per row
        // contentContainerStyle={styles.gridContainer}// Style for the grid container
      />
      </View>
    {/* </View> */}

  
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
