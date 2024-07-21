import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseconfig';

function WhiteScreen(props) {
  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { email, password, role } = session;
        console.log("asyn Data :"+ JSON.stringify(session))
        

        // Use Firebase email and password authentication to sign in the user
        if(role == 'parent')
        {

          signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            props.navigation.replace('ParentDashboard');
          })
          .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
            props.navigation.replace('Login');
          });

        }
        if(role == 'teacher')
        {
          signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            props.navigation.replace('teacherDashboard');
          })
          .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
            props.navigation.replace('Login');
          });

        }
        if(role == 'security')
        {
          signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            props.navigation.replace('SecurityDashboard');
          })
          .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
            props.navigation.replace('Login');
          });

        }
        
      } else {
        props.navigation.replace('Login');
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
      props.navigation.replace('Login');
    }
    
  };

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={require('../../icons/schoollogo.jpg')} 
        style={styles.image}
      />

      {/* Logo Name */}
      <Text style={styles.logoName}>School Security System</Text>
      <Text style={styles.subTitle}>Using RFID</Text>

      {/* Loading spinner */}
      <ActivityIndicator size='large' color='white' style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA', 
  },
  image: {
    width: 200,
    height: 200, 
    marginBottom: 20, 
  },
  logoName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#800080', // Text color
    marginBottom: 10, 
  },
  spinner: {
    marginBottom: 100, 
    backgroundColor: '#a83902',
    borderRadius: 20,
    marginTop:20
  },
  subTitle: {
    fontSize: 18,
    color: '#800080', 
  },
});

export default WhiteScreen;
