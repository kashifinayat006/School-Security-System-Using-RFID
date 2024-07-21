import React,{useState ,useEffect,useCallback} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet ,Image ,ScrollView ,RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from './CustomHeader';
import LinearGradient from 'react-native-linear-gradient';
import { ref, child, get, getDatabase, onValue } from "firebase/database";
import { auth } from '../../firebase/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


  const  HeaderTop =  () =>
  {
    return(
      <View style={styles.headerTop}>
<Text style={styles.headerText} >Parent Account</Text>
</View>
        
       
  
    )
  }




 



  
const Home = (props) => {
  const [students, setStudents] = useState([]);
  const [childrenList , setChildrenList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cnic ,setCnic ] = useState();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
   

    
    getUID();

   
    setRefreshing(false);
  }, []);

  const modules = [
    { id : '1', name: 'Attendance',onPress :handleAttendance, icon: 'person' },
    { id : '2', name: 'Leave',onPress: handleLeave, icon: 'event' },
    { id : '3', name: 'New Card',onPress: handleNewCard, icon: 'add-box' },
    { id : '4', name: 'Child Table',onPress: handleStudentTable, icon: 'grid-on' },
   
  ];

 


  function handleAttendance (){
    console.log('a');
    props.navigation.navigate('ParentAttendance')
  }
  function handleLeave (){
    console.log('l');
    props.navigation.navigate('ParentLeave')
  
  }
  function handleNewCard (){
    console.log('r');
    props.navigation.navigate('ParentNewCard')
  }
  function handleStudentTable (){
    console.log('r');
    props.navigation.navigate('ChildTable')
  }



  useEffect(() => {
    
    getUID();
  }, [cnic]);
  
  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid ,cnic } = session;
        setCnic(cnic)
       
        fetchChildrenData(cnic); 
        console.log(cnic)
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
     
    }
  }

  const fetchChildrenData = async (cnic) => {
    const dbRef = ref(getDatabase());
    var count = 0;
  
    get(child(dbRef, 'StudentData/' + cnic))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const childrenList = [];
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            count = count + 1;
            const firstName = data.firstname;
            const lastName = data.lastname;
            const childId = childSnapshot.key; 
            const cl = data.cName;
  
           
            const children = {
              count,
              firstName,
              lastName,
              childId,
              cl,
            };
            childrenList.push(children);
          });
  
        
          setChildrenList(childrenList);
         
          fetchChildrenStatus(childrenList);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };


  const fetchChildrenStatus = async (childrenList) => {
    const currentDate = getCurrentDate();
    const dbRef = ref(getDatabase());
  
    // Fetch data from AllStudentsInOutTime for the current date
    get(child(dbRef, `AllStudentsInOutTime/${currentDate}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const childrenStatusList = [];
  
          // Iterate through childrenList and check for matching IDs in snapshot
          childrenList.forEach((child) => {
            const childId = child.childId;
            const statusData = snapshot.child(childId).val();
  
            // Add in-time and out-time if data exists, otherwise add empty strings
            childrenStatusList.push({
              ...child,
              inTime: statusData ? statusData.inTime : '',
              outTime: statusData ? statusData.outTime : '',
            });
          });
  
          // Update the state with the children status data
          setChildrenList(childrenStatusList);
          console.log(childrenStatusList)
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  

 

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const year = today.getFullYear();
  
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  };

  
  
    renderChildItem = ({ item }) => (
      <ScrollView style={styles.childCard}>
        <Text style={styles.childName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.statusText}>In-Time: {item.inTime}</Text>
        <Text style={styles.statusText}>Out-Time: {item.outTime}</Text>
      </ScrollView>
    );
  
    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={{
          ...styles.moduleButton,
          backgroundColor: lightColors[item.id - 1], 
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
   
   


        <HeaderTop/>
      
        <CustomHeader/>
      

   

      <View style={styles.gridContainer} >
      <FlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} 
       
      />
      </View>

    
      <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Children's Status</Text>
          
          <FlatList
            data={childrenList}
            renderItem={this.renderChildItem}
            keyExtractor={(item) => item.count.toString()}
            contentContainerStyle={styles.childrenContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
          
        </View>
        
    
    </LinearGradient>
   
    
  );
};
const iconColors = ['green', 'blue', 'red', 'purple', 'orange', 'pink'];
const lightColors = [ 'white', 'white',  'white', 'white'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
   
  },
  
  headerTop: {
    backgroundColor: '#550A35',
     
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
    justifyContent: 'space-between',
    flexGrow: 0,
    width: '100%',
    marginTop: 3,
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
    borderColor: 'grey', 
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
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    margin: 10,
    marginTop: 1,
    height:350,
    backgroundColor: 'lightgrey', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 8,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
    borderBottomLeftRadius: 19,
    color: 'white',
    textAlign: 'center',
  },
  
  childrenContainer: {
    padding: 6,
    paddingTop:1,
    paddingBottom:1,
  },
  
  childCard: {
    backgroundColor: 'white',
    marginVertical: 6,
    padding: 6,
    borderRadius: 15,
    borderColor:'black',
   
    elevation: 9,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingBottom:9,
  },
  
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  statusText: {
    fontSize: 15,
    color: '#555',
    marginTop: 10,
  },
});


export default Home;
