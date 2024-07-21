import React, { useState ,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet ,Image} from 'react-native';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {ref,child,get,getDatabase,onValue,set,update } from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';
const HeaderTop = () => {
    return (
      <View style={styles.headerTop}>
        <Text style={styles.headerText}>Change Password</Text>
      
      </View>
      
    );
  }
function ChangePassword() {
   
       

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigation = useNavigation();

    const handleChangePassword = async () => {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            signInWithEmailAndPassword(auth, currentUser.email, currentPassword)
                .then((userCredential) => {

                    const user = userCredential.user;
                    updatePassword(user, newPassword).then(() => {
                        alert('Password Changed Successfully');
                        updateSaveSession(newPassword)
                    }).catch((error) => {

                    });

                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    if(errorCode == 'auth/wrong-password')
                    {
                        alert('Wrong Current Password')

                    }
                });


        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    const updateSaveSession = async (password) =>{
        try {
            const sessionString = await AsyncStorage.getItem('userSession');
            if (sessionString) {
              const session = JSON.parse(sessionString);
              const { role , CardID} = session;
      
              // Use Firebase email and password authentication to sign in the user
              if(role == 'parent')
              {
                session.password = password;
                  AsyncStorage.setItem('userSession', JSON.stringify(session))
                    .then(() => {
                        console.log('saved')
                        navigation.goBack();

                    })
                    .catch((error) => {
                      console.log('Error saving session:', error);
                    });
              }
              if(role == 'teacher')
              {
                session.password = password;
                  AsyncStorage.setItem('userSession', JSON.stringify(session))
                    .then(() => {
                        console.log('saved')
                        updateTeacherRecord(CardID)
                        navigation.goBack();
                    })
                    .catch((error) => {
                      console.log('Error saving session:', error);
                    });
              
              }
              if(role == 'security')
              {
                session.password = password;
                  AsyncStorage.setItem('userSession', JSON.stringify(session))
                    .then(() => {
                        console.log('saved')
                        navigation.goBack();
                    })
                    .catch((error) => {
                      console.log('Error saving session:', error);
                    });
      
              }
              
            } else {
              
            }
          } catch (error) {
            console.log('Error checking saved session:', error);
            
          }

    }

    function updateTeacherRecord(cardID)
    {
        const dbRef = ref(getDatabase());

    const newPasswordUpdateRef = child(dbRef, `TeacherData/${cardID}/`);

    update(newPasswordUpdateRef,{password : newPassword})

    }

    const GradientButton = ({ onPress, title }) => (
        <TouchableOpacity onPress={onPress}>
          <LinearGradient
            colors={['#550A35', '#7D0552']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    return (
        <LinearGradient
        colors={['#FFFAF0', '#FFFAF0']}
      
      start={{ x: 1, y: 2 }}
      end={{ x: 3, y: 1 }}
      style={styles.container}
      
        >
          <HeaderTop />
        
    <View style={styles.externalListConatiner}>
<View style={styles.ChangePasswordLogoStyling}>
<Image
        source={require('../icons/changepassword.png')} 
        style={styles.logo}
      />
</View>
            <TextInput 
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry
                onChangeText={setCurrentPassword}
            />
           
            <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                onChangeText={setNewPassword}
            />
            
            <View style={styles.buttonContainer}>
       <GradientButton onPress={handleChangePassword} title="Change Password" />
       </View>
           
        </View>
      
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
       
        marginTop: 20,
      },
      headerTop: {
        backgroundColor: '#550A35', // Dark blue color for the header
        
          justifyContent: 'center',
          alignItems: 'center',
          height: 60,
         marginTop:"-10.3%",
         marginLeft:-20,
         marginRight:-20,
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
      },
     
  
      headerText: {
        color: 'white', // White color for the header text
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 20,
      },
      externalListConatiner: {
        borderWidth: 1,
        height:290,
        borderColor: 'grey',
        borderRadius: 35,
       paddingTop:40,
      
        margin: -8,
        marginTop: 120,
        backgroundColor: 'lightgrey', // Light grey background
        shadowColor: 'black',// black color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
      ChangePasswordLogoStyling:
      {
       
        alignItems: 'center',
        marginTop:-90,
      
      },
    input: {
alignSelf:'center',

         alignSelf: 'center',
  height: 40,
  width: '80%',
  borderColor: '#7D0552',
  borderWidth: 1,
  marginBottom: 10,  // Decreased marginBottom
  marginTop: 20,    // Decreased marginTop
  borderRadius: 8,
  backgroundColor: 'white',
  color: '#7D0552',
    },
    button: {
       
        padding: 10,
        borderRadius: 15,
        marginRight:30,
        marginLeft:30
    },
    buttonContainer:
{
   
   marginTop:80,

},
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    logo: {
        width: 100, 
        height: 100, 
        resizeMode: 'contain', 
      },
});

export default ChangePassword;
