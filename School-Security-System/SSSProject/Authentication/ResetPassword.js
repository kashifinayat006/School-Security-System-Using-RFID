import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const handleResetPassword = async () => {
    // Validate the email address (you can use a library like 'validator')
    if (!email) {
      Alert.alert('Email is required');
    } else {
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);

        // Password reset email sent successfully
        setModalVisible(true);
        setTimeout(() => setModalVisible(false), 3000);
      } catch (error) {
        // Handle errors here (e.g., invalid email, user not found, etc.)
        console.error('Error sending password reset email:', error.message);
        Alert.alert('Error', 'Failed to send password reset email. Please check your email and try again.');
      }
    }
  };

  return (
    <LinearGradient
      colors={['#007bff', '#5bc0de']}
      style={styles.container}
    >
      <Text style={styles.header}>Reset Password</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalMessage}>
            Password reset email sent to: {email}
          </Text>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    width: 300,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
  },
});

export default ResetPassword;
