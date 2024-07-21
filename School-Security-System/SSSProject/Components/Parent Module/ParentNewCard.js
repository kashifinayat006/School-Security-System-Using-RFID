import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, push, child, get, getDatabase, onValue ,update} from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { CheckBox } from 'react-native-elements';


const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Apply for New Card</Text>
    </View>
  );
}

const NewCard = () => {

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
  const [cnic, setCNIC] = useState('');
  const [childList, setChildList] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [parentName, setParentName] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => {
    console.log('Toggling modal...');
    setModalVisible(!isModalVisible);//true
  };
  const toggleModalClose = () => {
    console.log('Toggling modal close...');
    setModalVisible(isModalVisible);//false
  };

  const toggleChildSelection = (childId) => {
    if (selectedChildren.includes(childId)) {
      // If already selected, remove from the array
      setSelectedChildren(selectedChildren.filter((id) => id !== childId));
    } else {
      // If not selected, add to the array
      setSelectedChildren([...selectedChildren, childId]);
    }
  };



  const fetchChildNames = async (cnic) => {
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
            const childId = childSnapshot.key; // Get the child's ID
            const childClass = data.cName;
           
            // Create a student object with number, name, and ID
            const children = {
              count,
              firstName,
              lastName,
              childId,
              childClass,
            };
            childrenList.push(children);
          });

          // Update the state with the child data
          setChildList(childrenList);
          
          // fetchTeacherCardRequestData();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };




  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { CardID, uid, cnic } = session;
        setUserUid(uid);
        getName(uid);
        fetchTeacherCardRequestData(uid);
        fetchChildNames(cnic);
        console.log('cnic is :', cnic)

      }
    } catch (error) {
      console.log('Error checking saved session:', error);
    }
  };

  function getName(uid) {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `FatherData/${uid}`);

    // Set up a listener for real-time updates
    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        setCNIC(snapshot.val().cnic)
        setParentName(snapshot.val().firstname + " " + snapshot.val().lastname)
      } else {
        console.log("No data available");
      }
      // Stop loading when data is fetched
    });
  }

  useEffect(() => {
    getUID();
    fetchTeacherCardRequestData(userUid);

  }, []);

  // useEffect(() => {
  //   fetchTeacherCardRequestData ();
  //   // console.log('parents:', teacherLeaveData);
  // }, [teacherLeaveData]);


  const fetchTeacherCardRequestData = async (uid) => {
    setIsLoading(true);
    setModalVisible(false);
    try {
      const dbRef = ref(getDatabase());
      const CardRequestRef = child(dbRef, 'NewCardRequests/Parents/' + uid);

      const dataSnapshot = await get(CardRequestRef);

      if (dataSnapshot.exists()) {
        const data = dataSnapshot.val();
        const leaveData = Object.values(data);

        const formattedLeaveData = Object.keys(data).map((applyDate) => {
          const requests = data[applyDate];
          const formattedRequests = Object.keys(requests).map((requestId) => {
            const cardRequest = requests[requestId];
            return {
              ID: cardRequest.parentID,
              Name: cardRequest.childName,
              childClass: cardRequest.childClass,
              reason: cardRequest.reason,
              applyDate,
              status: cardRequest.status,
            };
          });
          return formattedRequests;
        });

        // Flatten the array of arrays
        const allLeaveData = formattedLeaveData.flat();

        // console.log('Teacher Leave Data:', allLeaveData);
        setTeacherLeaveData(allLeaveData);
      } else {
        console.log('No teacher leave data available');
      }
    } catch (error) {
      console.error('Error fetching teacher leave data:', error);
    }
    finally {
      setIsLoading(false); // Stop loading, whether successful or not
    }
  };

  const handleApplyNewCardRequest = () => {


    const currentDate = new Date();
    const applyDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getFullYear()}`;

    const leaveRequest = {
      childData: selectedChildren.reduce((childData, childId) => {
        const selectedChild = childList.find((child) => child.childId === childId);
        childData[childId] = {
          childName: `${selectedChild.firstName} ${selectedChild.lastName}`,
          parentID: userUid,
          parentName: parentName,
          parentCNIC: cnic,
          childClass : selectedChild.childClass,
          applyDate,
          reason,
          status: 'pending',
        };



        return childData;
      }, {}),
    };





    const dbRef = ref(getDatabase(), 'NewCardRequests/Parents/' + userUid + '/' + applyDate);
    update(dbRef, leaveRequest.childData)
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
  const handleCloseAndFetchData = () => {
    toggleModalClose();
    // toggleModalClose(); // Close the modal
    fetchTeacherCardRequestData(userUid); // Fetch teacher leave data
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
        <View style={styles.myLeaveDataContainer}>

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
            <View style={[styles.leaveItem, styles.listContainer ]} key={index}>
              <Text style={styles.applyDate}>
                Apply Date: {leave.applyDate}
              </Text>
              <Text style={styles.leaveText}>
                Child name : {leave.Name}
              </Text>


              <Text style={styles.leaveText}>
                Reason: {leave.reason ? leave.reason : 'No reason provided'}
              </Text>
              <View style={styles.leaveStatusContainer}>
                <Text style={styles.leaveStatusLabel}>Status: </Text>
                {leave.status ? (
                  <Text style={styles.leaveStatus}>{leave.status}</Text>
                ) : (
                  <Text style={styles.pendingStatus}>
                    ⏳ Pending
                  </Text>
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

      {/* Model */}

      <ScrollView>
        <Modal isVisible={isModalVisible}>
          <View style={styles.myLeaveDataContainer}>
            <Text style={styles.modalTitle}>Applying for New Card</Text>
          </View>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.listContainer}>
              <ScrollView>
              <Text style={styles.selectChild}>Select Child:</Text>
              <View>
                {childList.map((child, index) => (
                  <View key={index} style={styles.checkboxContainer}>
                    <CheckBox
                      checked={selectedChildren.includes(child.childId)}
                      onPress={() => toggleChildSelection(child.childId)}
                      checkedColor="#054f96"  // dark blue checkbox color when checked
                    />
                    <Text style={styles.checkboxLabel}>{`${child.firstName} ${child.lastName}`}</Text>
                  </View>
                ))}
              </View>
              </ScrollView>
            </View>

            <Text style={styles.reasonlabel}>Reason for new card</Text>
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  datePickerContainer: {
    marginTop: 10,

    scrollViewContainer: {
      flexGrow: 1,
    },

  },
  reasonlabel: {
        fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  button: {
    backgroundColor: '#475563',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },

  inputField: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    margin: 0,
    borderTopRightRadius:0,
    borderTopRightRadius:0,
    color: 'black',
    minHeight: 100,
  },


  // Model Styling
  modalContainer: {
    flex: 1,
    backgroundColor: 'lightgrey', 
    padding: 10, 
    borderRadius: 10, 
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15, 
    shadowRadius: 2.5,
    width: '105%', 
    alignSelf: 'center', 

  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',

  },
  selectChild: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    backgroundColor: 'darkblue',
    padding: 12,
    borderRadius: 35,
    marginVertical: 8,
    elevation: 6,
    width: '30%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    height: '6%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: 'green', 
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
  submitButton: {
    backgroundColor: 'green',
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
  leaveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveStatusLabel: {
    marginRight: 5, 
    color: 'black', 
  },
  leaveStatus: {
    color: 'green',
  },
  pendingStatus: {
    color: 'red',

  },

  pickerContainer: {
    backgroundColor: 'white', 
    borderRadius: 8,          
    paddingLeft: 10,
    paddingRight: 10                        
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: 'black',
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    borderBottomLeftRadius:6,
    borderBottomRightRadius:6,
    margin: 4,
    marginTop: 1,
    marginTop: 1,
    backgroundColor: 'white', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  externalListConatiner: {
    borderWidth: 1,
    height: "88%",
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    margin: -12,
    marginTop: -9,
    
    backgroundColor: 'lightgrey', 
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  myLeaveDataContainer: {

    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    
    color: 'white',
    textAlign: 'center',
    marginTop: 6,
    width: '107.12%', // width for a wider appearance
    alignSelf: 'center',

  },
 headerTop: {
  backgroundColor: '#550A35', 
 
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
    color: 'white', 
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
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





    separator: {
      marginVertical: 4,
     
     
    },
  

});

export default NewCard;
