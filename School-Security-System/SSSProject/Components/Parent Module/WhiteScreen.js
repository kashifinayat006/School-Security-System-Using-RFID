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
          alert('teacher')
          signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            props.navigation.replace('Dashboard');
          })
          .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
            props.navigation.replace('Login');
          });

        }
        if(role == 'security officer')
        {
          signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            props.navigation.replace('Dashboard');
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
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={require('../../icons/schoollogo.jpg')} // Replace with the path to your image
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
    backgroundColor: '#F5F6FA', // Change the background color to your desired color
  },
  image: {
    width: 200,
    height: 200, // Adjust the image height as needed
    marginBottom: 20, // Adjust the margin as needed
  },
  logoName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#800080', // Text color
    marginBottom: 10, // Adjust the margin as needed
  },
  spinner: {
    marginBottom: 100, // Adjust the margin as needed
    backgroundColor: '#a83902', // Make the background transparent
    borderRadius: 20,
    marginTop:20
  },
  subTitle: {
    fontSize: 18,
    color: '#800080', // Purple color for the subtitle
  },
});

export default WhiteScreen;
