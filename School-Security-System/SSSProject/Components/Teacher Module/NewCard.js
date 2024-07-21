import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, push, child, get, getDatabase, onValue } from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';



const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Apply for Card</Text>
    </View>
  );
}

const ApplyRequest = () => {
  const [date, setDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [teacherLeaveData, setTeacherLeaveData] = useState([]);
  const [userUid, setUserUid] = useState('');
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [Class, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => {
    console.log('Toggling modal...');
    setModalVisible(!isModalVisible);//true
  };
  const toggleModalClose = () => {
    console.log('Toggling modal close...');
    setModalVisible(isModalVisible);//false
  };

  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID } = session;
        setUserUid(CardID);
        getName(CardID); // Pass the UID to getClass
        getClass(CardID);
        getEmail(CardID);
        fetchTeacherCardRequestData();
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }
  };

  function getName(uid) {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `TeacherData/${uid}`);

    // Set up a listener for real-time updates
    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        setFName(snapshot.val().firstname);
        setLName(snapshot.val().lastname);
        setClassName(snapshot.val().class)
      } else {
        console.log("No data available");
      }
      // Stop loading when data is fetched
    });
  }

  useEffect(() => {
    fetchTeacherCardRequestData();
    getUID();
  }, []);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'; // Pending icon
      case 'accepted':
        return '✅'; // Accepted icon
      case 'rejected':
        return '❌'; // Rejected icon
      default:
        return ''; // Default case (no icon)
    }
  };
  const handleCloseAndFetchData = () => {
    // toggleModalClose(); // Close the modal
    toggleModalClose();
    fetchTeacherCardRequestData(); // Fetch teacher leave data
  };
  const fetchTeacherCardRequestData = async () => {
    setIsLoading(true);
    setModalVisible(false);
    try {
      const dbRef = ref(getDatabase());
      const teacherCardRequestRef = child(dbRef, 'NewCardRequest');

      const dataSnapshot = await get(teacherCardRequestRef);

      if (dataSnapshot.exists()) {
        const data = dataSnapshot.val();
        const leaveData = Object.values(data);
        console.log('isModalVisible:', isModalVisible);

        const formattedLeaveData = Object.values(data).map((item) => {
          const cardRequest = item[Object.keys(item)[0]];
          return {
            ID: cardRequest.ID,
            Name: cardRequest.Name,
            Class: cardRequest.class,
            reason: cardRequest.reason,
            applyDate: cardRequest.applyDate, // Fetch the apply date

            status: cardRequest.status,
          };
        });

        console.log(leaveData);
        setTeacherLeaveData(formattedLeaveData);
        console.log('Teacher Leave Data after setting state:', leaveData);
      } else {
        console.log('No teacher leave data available');
      }
    } catch (error) {
      console.error('Error fetching teacher leave data:', error);
    }finally {
      setIsLoading(false); // Stop loading, whether successful or not
    }
  }
  const handleApplyNewCardRequest = () => {
    const currentDate = new Date();
    const applyDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;


    const NewCardRequest = {
      ID: userUid,
      Name: fname + ' ' + lname,
      Class,
      reason ,
      status: 'pending',
      applyDate,
    };



    const dbRef = ref(getDatabase(), 'NewCardRequest/' + applyDate + '/' + userUid);
    set(dbRef, NewCardRequest)
      .then(() => {
        alert('Leave request submitted successfully');
      })
      .catch((error) => {
        console.error('Error saving leave request: ', error);
      });

  };
  const filterUserLeaves = () => {
    return teacherLeaveData.filter(leave => leave.ID === userUid);
  };
  const GradientButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
       colors={['#550A35', '#7D0552']}
       start={{ x: 0, y: 1 }}
       end={{ x: 1, y: 1 }}
        style={styles.GradientButton}
      >
        <Text style={styles.GradientButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
    colors={['#FFFAF0', '#FFFAF0']}

      start={{ x: 1, y: 2 }}
      end={{ x: 3, y: 1 }}
    >

      <View style={styles.container}>

        <HeaderTop />
        <View style={styles.myCardDataHeadingContainer}>

          <Text style={styles.modalTitle}>Card Request</Text>
        </View>
        <ScrollView style={styles.externalListConatiner}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue"  />
        </View>
      ) : (
        <>
          {filterUserLeaves().map((leave, index) => (
            <View style={[styles.leaveItem, styles.listContainer]} key={index}>
              <Text style={styles.applyDate}>
                Apply Date: {leave.applyDate}
              </Text>

              <Text style={styles.leaveText}>
                Reason: {leave.reason ? leave.reason : 'No reason provided'}
              </Text>
              <View style={styles.leaveStatusContainer}>
                      <Text style={styles.leaveStatusLabel}>Status: </Text>
                      {leave.status ? (
                        <Text style={styles.leaveStatus}>{getStatusIcon(leave.status)} {leave.status}</Text>
                      ) : (
                        <Text style={styles.noStatus}>No Status provided</Text>
                      )}
                    </View>
              <View style={styles.separator} />
            </View>
          ))}
          </>  
)}
        </ScrollView>
      </View>
     
      <GradientButton onPress={toggleModal} title="Apply Now" />

      <ScrollView>
        <Modal isVisible={isModalVisible}>

          <View style={styles.myCardDataHeadingContainer}>
            <Text style={styles.modalTitle}>Applying for New Card</Text>
          </View>

          <View style={styles.modalContainer}>

            <ScrollView contentContainerStyle={styles.container}>
              <Text style={styles.label}>Reason for new card</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter reason here"
                value={reason}
                onChangeText={(text) => setReason(text)}
                multiline={true}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleApplyNewCardRequest}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </ScrollView>

          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseAndFetchData}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
     






    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',

  },
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
       // Negative margin to extend on the right
      justifyContent: 'center',
      alignItems: 'center',
      height: 60,
     marginTop:-21,
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
  myCardDataHeadingContainer: {



    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, // Increased padding for better visual balance
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop: 6,
    width: '104.7%', // Increased width to 80% for a wider appearance
    alignSelf: 'center',



  },
  externalListConatiner: {
    borderWidth: 1,
    height: 590,
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    margin: -8,
    marginTop: -9,

    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  datePickerContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  submitButton: {
    backgroundColor: 'green', // Use a color that complements your app's theme
    padding: 12,
    borderRadius: 15,
    marginVertical: 8,
    elevation: 6,
    width: '40%',

    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#054f96',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: 'green', // Use a color that complements your app's theme
    padding: 12,
    borderRadius: 15,
    marginVertical: 8,
    elevation: 6,
    width: '40%',

    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  inputField: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
    margin: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    color: 'black',
    minHeight: 100,
  },


  // Model Styling

  modalContainer: {
    flex: 1,
    backgroundColor: 'lightgrey', // Semi-transparent white background
    padding: 10, // Decreased padding for a smaller container
    borderRadius: 10, // Rounded corners
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
    shadowColor: '#000',
    shadowOffset: {
      width: 5, // Adjusted shadow offset for a smaller shadow
      height: 2,
    },
    shadowOpacity: 0.15, // Decreased shadow opacity for a subtler effect
    shadowRadius: 2.5,
    width: '105%', // Decreased width for a narrower container
    alignSelf: 'center', // Center the container horizontally
    
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',

  },

  applyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    margin: 6,
    marginTop: 10,
    marginBottom:-3,
    backgroundColor: 'white', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  leaveItem: {
    marginVertical: 10,
  },
  leaveText: {
    fontSize: 16,
    color: 'black',
  },
  separator: {
    marginVertical: 3,

  },
  closeButton: {
    backgroundColor: '#0074e4',
    padding: 15,
    borderRadius: 5,
    margin: 10,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 20,
    margin: 4,
    elevation: 9,
    width: '30%',
    alignSelf: 'center',
  },
  leaveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveStatusLabel: {
    marginRight: 5, // Adjust the spacing between label and status as needed
    color: 'black', // Set the color for the label
  },
  leaveStatus: {
    color: 'green', // Set the color for a status other than "Pending"
    fontWeight:'bold'
  },
  noStatus: {
    color: 'red', // Set the color for the "Pending" text

  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
    marginTop:250
    
  },
  GradientButton: {
       
    padding: 10,
    borderRadius: 15,
    marginRight:30,
    marginLeft:30,
    marginTop:-30
},
  GradientButtonText: {
    color: 'white',
    textAlign: 'center',
},
});

export default ApplyRequest;
