import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity ,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const VerificationMessage = ({ route }) => {
  const { email } = route.params;
  const navigation = useNavigation();

  const handleLoginPress = () => {
    // Navigate to the login screen or the screen where your login form is located
    navigation.navigate('Login'); // Replace 'Login' with the name of your login screen
  };

  return (
    <View style={styles.container}>
        <Image
        source={require('../icons/email_logo.jpg')} // Replace with the path to your image
        style={styles.image}
      />
      <Text style={styles.text}>A verification email has been sent to:</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.text}>Please check your inbox and click the verification link.</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
        <Text style={styles.loginButtonText}>Go to LogIn page</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'black',
    marginVertical: 10,
  },
  email: {
    fontSize: 20,
    color: 'green',
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: '#05a181',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
  },
  image:{
    width: 200,
    height: 200, // Adjust the image height as needed
    marginBottom: 20,
    borderRadius:20
  }
});

export default VerificationMessage;
