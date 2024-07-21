import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set, getDatabase, child, get } from 'firebase/database';
import { auth, database } from '../firebase/firebaseconfig';

const SignupScreen = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [cnic, setCNIC] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [CNICErrorMessage, setCNICErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstNameErrorMessage , setFirstNameErrorMessage]= useState('')
  const [lastNameErrorMessage,setLastNameErrorMessage] = useState('');
  const [phoneNumberErrorMessage , setPhoneNumberErrorMessage] = useState('');
  const [addressErrorMessage , setAddressErrorMessage] = useState('');


  const checkCNICExistence = async (cnic) => {
 
    const dbRef = ref(getDatabase(),'StudentData');
   
  
    try {
      const snapshot = await get(child(dbRef, cnic));
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking CNIC existence:', error);
      return false;
    }
  };



  const checkCNIC = async () => {
    setCNICErrorMessage('');
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFirstNameErrorMessage('');
    setLastNameErrorMessage('');
    setAddressErrorMessage('');
    setPhoneNumberErrorMessage('');
    setCNICErrorMessage('');

    console.log('checkCNIC')
    var cnicAccountExist = false;
    const cnicExists = await checkCNICExistence(cnic);

    if (cnicExists) {

      const dbRef = ref(getDatabase());
      await get(child(dbRef, `FatherData/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              
              if (data.cnic == cnic) {
                setCNICErrorMessage('CNIC is Already Exist');
                cnicAccountExist = true;
              }
            });
          }
        })
        .then(() => {
          if (cnicAccountExist == false) {
            handleSignup();
          }
        })
        .catch((error) => {
          console.error(error);
        });

    } else {
     
      alert('This CNIC not Allow by Admin');
    }

   
  };

  const handleSignup = () => {
    setLoading(true);
    setCNICErrorMessage('');
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFirstNameErrorMessage('');
    setLastNameErrorMessage('');
    setAddressErrorMessage('');
    setPhoneNumberErrorMessage('');
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(firstName)) {
      setFirstNameErrorMessage('First Name should only contain alphabets');
      setLoading(false);
      return;
    }

    if (!nameRegex.test(lastName)) {
      setLastNameErrorMessage('Last Name should only contain alphabets');
      setLoading(false);
      return;
    }

    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      phoneNumber.trim() === '' ||
      address.trim() === '' ||
      cnic.trim() === '' ||
      email.trim() === '' ||
      password.trim() === ''
    ) {
      if (firstName.trim() === '') {
        setFirstNameErrorMessage('First Name is required');
      }
      if (lastName.trim() === '') {
        setLastNameErrorMessage('Last Name is required');
      }
      if (phoneNumber.trim() === '') {
        setPhoneNumberErrorMessage('Phone Number is required');
      }
      if (address.trim() === '') {
        setAddressErrorMessage('Address is required');
      }
      if (cnic.trim() === '') {
        setCNICErrorMessage('CNIC is required');
      }
      if (email.trim() === '') {
        setEmailErrorMessage('Email is required');
      }
      if (password.trim() === '') {
        setPasswordErrorMessage('Password is required');
      }
      setLoading(false);
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Account created successfully');

        INSERTDATA(user.uid);
        sendEmailVerification(auth.currentUser)
          .then(() => {
            console.log('Verification email sent');
            props.navigation.navigate('VerificationMessage', { email });
          })
          .catch((error) => {
            // Handle email verification error
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        if (errorCode === 'auth/email-already-in-use') {
          setEmailErrorMessage('Email is already in use. Please try another one');
        }

        if (errorCode === 'auth/weak-password') {
          setPasswordErrorMessage('Password must be at least 6 characters long');
        }

        if (errorCode === 'auth/invalid-email') {
          setEmailErrorMessage('Invalid Email');
        }

        if (errorCode === 'auth/missing-email') {
          setEmailErrorMessage('Missing email');
        }
        if (errorCode === 'auth/internal-error') {
          setPasswordErrorMessage('Password missing');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function INSERTDATA(uid) {
    set(ref(database, 'FatherData/' + uid), {
      firstname: firstName,
      lastname: lastName,
      address: address,
      phonenumber: phoneNumber,
      cnic: cnic,
      email: email,
    });
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled keyboardVerticalOffset={-230}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Create Parent Account</Text>
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
        />
        {firstNameErrorMessage ? <Text style={{ color: 'red' }}>{firstNameErrorMessage}</Text> : null}

        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
        />
        {lastNameErrorMessage ? <Text style={{ color: 'red' }}>{lastNameErrorMessage}</Text> : null}

        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
          keyboardType="numeric"
          maxLength={11}
        />
        {phoneNumberErrorMessage ? <Text style={{ color: 'red' }}>{phoneNumberErrorMessage}</Text> : null}

        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
        />
        {addressErrorMessage ? <Text style={{ color: 'red' }}>{addressErrorMessage}</Text> : null}

        <TextInput
          label="CNIC Number"
          value={cnic}
          onChangeText={(text) => {
            // Remove non-numeric characters and format CNIC with dashes
            const formattedCNIC = text.replace(/\D/g, '');
            let formattedValue = '';

            for (let i = 0; i < formattedCNIC.length; i++) {
              formattedValue += formattedCNIC[i];
              if (i === 4 || i === 11) {
                formattedValue += '-'; // Add hyphen after 5th and 12th characters
              }
            }

            setCNIC(formattedValue);
          }}

          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
          keyboardType="numeric"
          maxLength={15}
        />
        {CNICErrorMessage ? <Text style={{ color: 'red' }}>{CNICErrorMessage}</Text> : null}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
        />
        {emailErrorMessage ? <Text style={{ color: 'red' }}>{emailErrorMessage}</Text> : null}

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          outlineColor="#3366FF"
          theme={{ colors: { primary: '#3366FF' } }}
          secureTextEntry={true}
        />
        {passwordErrorMessage ? <Text style={{ color: 'red' }}>{passwordErrorMessage}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#800080" />
        ) : (
          <Button mode="contained" onPress={checkCNIC} style={styles.button}>
            Sign Up
          </Button>
        )}

        <View style={styles.signupView}>
          <Text style={{ fontSize: 16 }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
            <Text style={{ color: '#800080', fontWeight: 'bold', fontSize: 16 }}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#800080',
  },
  signupView: {
    flexDirection: 'row',
    marginTop: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignupScreen;
