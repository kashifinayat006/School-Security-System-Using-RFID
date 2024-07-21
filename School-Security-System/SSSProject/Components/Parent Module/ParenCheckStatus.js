import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseconfig';

function ParentCheckStatus(props) {

  useEffect(() => {
    
    getUID();
  }, []);
  
  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid ,cnic } = session;
      
        console.log(cnic)
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
     
    }
  };
  
  return (
    <View style={styles.container}>
        <Text>Status</Text>
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
    color: '#800080',
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

export default ParentCheckStatus;
