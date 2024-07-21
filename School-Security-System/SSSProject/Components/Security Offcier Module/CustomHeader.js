import React, { useEffect ,useState } from 'react';
import { View, Text, Image, TouchableOpacity ,StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, child, get, getDatabase, onValue } from "firebase/database";
import { auth } from '../../firebase/firebaseconfig';

const CustomHeader = () => {
    const [userUid, setUserUid] = useState('');
    const [fname, setFName] = useState('');
    const [lname, setLName] = useState('');
    const [image , setImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScXyoZXpAWph9Vnu9_ZpWgNmn20W4hlBOn-5dLmFQuww8zSfnhRRNQW7B0RRuApO_PFwg&usqp=CAU');
    const [dummyImage ,setDummyImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScXyoZXpAWph9Vnu9_ZpWgNmn20W4hlBOn-5dLmFQuww8zSfnhRRNQW7B0RRuApO_PFwg&usqp=CAU')
    useEffect(() => {
        getName()
      }, []);

  
      function getName() {
        const dbRef = ref(getDatabase());
        const classRef = child(dbRef, `SecurityOfficerProfile/`);
    
        // Set up a listener for real-time updates
        onValue(classRef, (snapshot) => {
          if (snapshot.exists()) {
            setFName(snapshot.val().firstname);
            setLName(snapshot.val().lastname);
            setImage(snapshot.val().imageUrl);
    
            // Call displayStudents with the class information
            
          } else {
            console.log("No data available");
          }
    
           // Stop loading when data is fetched
        });
      }

    return (
      <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: image == undefined ? dummyImage : image}} 
          style={styles.profileImage}
        />
        <Text style={styles.username}>{fname} {lname}</Text> 
      </View>

     
      <View style={styles.ChangePasswordLogoStyling}>
 <Image
        source={require('../../icons/schoollogo3.png')} 
        style={styles.logo}
      /> 
</View>
    </View>
        
          
    );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#7D0552', 
    borderBottomEndRadius:100,
    borderBottomStartRadius:100,
    borderTopStartRadius:100,
    borderTopEndRadius:100,
    marginTop:3 ,
   marginLeft:6,
   marginRight:6,
    marginTop:-48,
    height:80,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 20,
    backgroundColor:'white'
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationIcon: {
    padding: 5,
  

  },

  logo: {
    width: 60, 
    height: 60, 
    resizeMode: 'contain', 
  },
});

export default CustomHeader;
