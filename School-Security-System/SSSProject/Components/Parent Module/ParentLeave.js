import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';


import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, push, child, get, getDatabase, onValue, update } from 'firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Picker} from '@react-native-picker/picker';
import {db} from '../../firebase/firebaseconfig'
import { CheckBox } from 'react-native-elements';

const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Apply for leave</Text>
    </View>
  );
}

const ParentLeave = () => {
  const [date, setDate] = useState(new Date());
  const [isSingleDay, setIsSingleDay] = useState(true);
  const [singleDayDate, setSingleDayDate] = useState(new Date());
  const [selectedSingleDate, setSelectedSingleDate] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const [isSingleDatePickerVisible, setSingleDatePickerVisible] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherLeaveData, setTeacherLeaveData] = useState([]);

  const [userUid, setUserUid] = useState('');
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [childList , setChildList] = useState([]);
  const [parentData , setParentData ] = useState({})





  const showSingleDatePicker = () => {
    setSingleDatePickerVisible(true);
  };

  const hideSingleDatePicker = () => {
    setSingleDatePickerVisible(false);
  };

  const showStartDatePicker = () => {
    setStartDatePickerVisible(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisible(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };

  const toggleModal = () => {

    console.log('Toggling modal...');
    setModalVisible(!isModalVisible);//true
  };
  const toggleModalClose = () => {
    console.log('Toggling modal...');
    setModalVisible(isModalVisible);//false
  };
  



  const handleSingleDateConfirm = (event, selectedDate) => {
    hideSingleDatePicker();
    if (selectedDate) {
      const formattedDate = `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`;
      setSelectedSingleDate(formattedDate);
      setSingleDayDate(selectedDate);
    }
  };
  const handleStartDateConfirm = (event, selectedDate) => {
    hideStartDatePicker();
    if (selectedDate) {
      const formattedDate = `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`;
      setSelectedStartDate(formattedDate);
      setStartDate(selectedDate);
    }
  };

  const handleEndDateConfirm = (event, selectedDate) => {
    
    hideEndDatePicker();
    if (selectedDate) {
      const formattedDate = `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`;
      setSelectedEndDate(formattedDate);
      setEndDate(selectedDate);
    }
  };
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
  const getUID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid ,cnic } = session;
        setUserUid(uid);
        getName(uid);
        fetchChildNames(cnic); 
      }
    } catch (error) {
      console.log('Error checking saved session:', error);
      // Stop loading on error
    }
  };
  function getName(uid) {
    const dbRef = ref(getDatabase());
    const classRef = child(dbRef, `FatherData/${uid}`);

    // Set up a listener for real-time updates
    onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        setFName(snapshot.val().firstname);
        setLName(snapshot.val().lastname);
        setParentData(snapshot.val())
     
        // setImage(snapshot.val().image);

        // Call displayStudents with the class information

      } else {
        console.log("No data available");
      }

      // Stop loading when data is fetched
    });
  }
useEffect(() => {
  fetchTeacherLeaveData();
  getUID();
}, [userUid]);

useEffect(() => {
  
  console.log('fwef:', teacherLeaveData);
}, [teacherLeaveData]);



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
            const childId = childSnapshot.key; 
            const cl = data.cName;
  
            // Create a student object with number, name, and ID
            const children = {
              count,
              firstName,
              lastName,
              childId,
              cl,
            };
            childrenList.push(children);
          });
  
          // Update the state with the child data
          setChildList(childrenList);
          console.log(childList);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  


    
 

  const fetchTeacherLeaveData = async () => {
    const uid = userUid;
    setIsLoading(true);
    setModalVisible(false);
    console.log(`Fetching teacher leave data for UID: ${uid}`);
  
    try {
      const dbRef = ref(getDatabase());
      const teacherLeaveRef = child(dbRef, `StudentsLeaveRequests/${uid}`);
      const dataSnapshot = await get(teacherLeaveRef);
  
      if (dataSnapshot.exists()) {
        const userLeavesData = dataSnapshot.val();
        const formattedLeaveData = [];
  
        // Iterate through leave entries for the specific UID
        for (const leaveKey in userLeavesData) {
          const leave = userLeavesData[leaveKey];
           if (leave.firstName != undefined){
          formattedLeaveData.push({
            ID: leaveKey,
            Name: leave.firstName + ' ' + leave.lastName,
            reason: leave.reason,
            applyDate: leave.applyDate,
            singleDay: leave.isSingleDay,
            startDate: leave.startDate,
            endDate: leave.endDate,
            status: leave.status,
          });
        }
        }
        if(formattedLeaveData.length > 0  && formattedLeaveData != undefined)
        {
          
        setTeacherLeaveData(formattedLeaveData);
        }
        console.log('Teacher Leave Data after setting state:', formattedLeaveData);
      } else {
        console.log(`No teacher leave data available for UID: ${uid}`);
      }
    } catch (error) {
      console.error('Error fetching teacher leave data:', error);
    } finally {
      setIsLoading(false); // Stop loading, whether successful or not
    }
  };



 const handleApplyLeave = () => {
  const currentDate = new Date();
  const applyDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${currentDate.getFullYear()}`;

    if (!isSingleDay && (!selectedStartDate || !selectedEndDate)) {
      alert('Please select both start and end dates for leave.');
    } else if (!isSingleDay && selectedStartDate > selectedEndDate) {
      alert('Start date cannot be after the end date.');
    } else if (isSingleDay && !selectedSingleDate) {
      alert('Missing Date of Leave', 'Please enter a date for leave.');
    } 
    else if (isSingleDay && selectedSingleDate < applyDate) {
      alert('Invalid start date', 'Please enter a date for leave.');
    }else if (!reason) {
      alert('Missing Reason for Leave', 'Please provide a reason for leave.');
    } else if (!isSingleDay && selectedStartDate < applyDate) {
      alert('Invalid Start Date', 'In valid Date Range');
    } else if (!isSingleDay && selectedStartDate === selectedEndDate) {
      alert('Start date and end date cannot be the same.');
    } else  {
      const leaveRequest = {
        childData: selectedChildren.reduce((childData, childId) => {
          const selectedChild = childList.find((child) => child.childId === childId);
          const key = `${childId},${applyDate}`;
      
          childData[key] = {
            firstName: selectedChild.firstName,
            lastName: selectedChild.lastName,
            parentID: userUid,
            class: selectedChild.cl,
            parentName: `${fname} ${lname}`,
            applyDate,
            reason,
            status: 'pending',
            childID : childId,
            parentCNIC : parentData.cnic,
          };
      
          // Add date details if it's not a single-day leave
          if (!isSingleDay) {
            childData[key].startDate = selectedStartDate;
            childData[key].endDate = selectedEndDate;
          } else {
            childData[key].isSingleDay = selectedSingleDate;
          }
      
          return childData;
        }, {}),
      };
      console.log(leaveRequest,applyDate)

    

      const dbRef = ref(getDatabase(), 'StudentsLeaveRequests/' + userUid + '/' );

     
      update(dbRef, leaveRequest.childData)
        .then(() => {
          alert('Leave request submitted successfully');
        })
        .catch((error) => {
          console.error('Error saving leave request: ', error);
        });
    }
  };

  // const filterUserLeaves = () => {
  //   console.log('Filtering leaves for user ID:', userUid);
  // return teacherLeaveData.filter((leave) => leave.parentID === userUid);
  // };
  const toggleChildSelection = (childId) => {
    if (selectedChildren.includes(childId)) {
      // If already selected, remove from the array
      setSelectedChildren(selectedChildren.filter((id) => id !== childId));
    } else {
      // If not selected, add to the array
      setSelectedChildren([...selectedChildren, childId]);
    }
  };

    // this function is used to close the model and also fetch the data of leave to display
    const handleCloseAndFetchData = () => {
      toggleModalClose(); // Close the modal
      fetchTeacherLeaveData(); // Fetch teacher leave data
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
         
          <Text style={styles.modalTitle}>My Leave Data</Text>
          </View>
   
   <ScrollView style={styles.externalListConatiner}>
   {isLoading ? (
          <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue"  />
        </View>
      ) : (
        <>
    {Array.isArray(teacherLeaveData) && teacherLeaveData.length > 0 ? (
  teacherLeaveData.map((leave) => (
    <View key={leave.ID} style={[styles.leaveItem, styles.listContainer ]}>
      <Text style={styles.applyDate}>Apply Date: {leave.applyDate}</Text>
      <Text style={styles.leaveText}>
      Child Name: {leave.Name}

      </Text>
      <Text style={styles.leaveText}>
        Date of Leave: {leave.singleDay ? leave.singleDay : `${leave.startDate ? leave.startDate : ''} → ${leave.endDate ? leave.endDate : ''}`}
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
   
    
    
  ))) : (
  <Text>No leave data available</Text>
)}
</>  
)}
 </ScrollView>
        </View>
        
     
      <GradientButton onPress={toggleModal} title="Apply Now" />
   


      <ScrollView>

      <Modal isVisible={isModalVisible}>

      <View style={styles.myLeaveDataContainer}>
      <Text style={styles.modalTitle}>Applying Leave</Text>
        </View>
       
      <ScrollView style={styles.modalContainer}>
        <View style={styles.listContainer}>
 <Text style={styles.selectChild}>Select Child:</Text>
<ScrollView>
<View >
    {childList.map((child, index) => (
      <View key={index} style={styles.checkboxContainer}>
        <CheckBox
          checked={selectedChildren.includes(child.childId)}
          onPress={() => toggleChildSelection(child.childId)}
          checkedColor="#054f96"  
        />
        <Text style={styles.checkboxLabel}>{`${child.firstName} ${child.lastName}`}</Text>
      </View>
    ))}
  </View>
  </ScrollView>
  </View>
  
  <Text style={styles.SelectingLabel}>Reason for Leave</Text>
    <TextInput
      style={styles.inputField}
      placeholder="Enter reason here"
      value={reason}
      onChangeText={(text) => setReason(text)}
      multiline={true}
    />

    <View style={styles.leaveDaylistContainer}>
    <Text style={styles.SelectingLabel}>Is it a single day leave?</Text>
    
    <View style={styles.leaevButtonContainer}>
    <TouchableOpacity style={styles.button} onPress={() => setIsSingleDay(true)}>
      <Text style={styles.buttonText}>Yes</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setIsSingleDay(false)}>
      <Text style={styles.buttonText}>No</Text>
    </TouchableOpacity>
    </View>
    
    {isSingleDay ? (
<>
<View style={styles.datePickerContainer}>
<Text style={styles.label}>Single Day Leave: </Text>
<TouchableOpacity style={styles.button} onPress={showSingleDatePicker}>
  <Text style={styles.buttonText}>{selectedSingleDate}</Text>
  <Icon name="calendar" size={20} color="white" />
</TouchableOpacity>
{isSingleDatePickerVisible && (
  <DateTimePicker
    isVisible={isSingleDatePickerVisible}
    mode="date"
    display="spinner"
    value={singleDayDate}
    onChange={handleSingleDateConfirm}
  />
)}
</View>

</>
) : (
<>
<View style={styles.datePickerContainer}>
<Text style={styles.label}>Start Date:</Text>
<TouchableOpacity style={styles.button} onPress={showStartDatePicker}>
  <Text style={styles.buttonText}>{selectedStartDate}</Text>
  <Icon name="calendar" size={20} color="white" />
</TouchableOpacity>
{isStartDatePickerVisible && (
  <DateTimePicker
    isVisible={isStartDatePickerVisible}
    mode="date"
    display="spinner"
    value={startDate}
    onChange={handleStartDateConfirm}
  />
)}
</View>
<View style={styles.datePickerContainer}>
<Text style={styles.label}>End Date: </Text>
<TouchableOpacity style={styles.button} onPress={showEndDatePicker}>
  <Text style={styles.buttonText}>{selectedEndDate}</Text>
  <Icon name="calendar" size={20} color="white" />
</TouchableOpacity>
{isEndDatePickerVisible && (
  <DateTimePicker
    isVisible={isEndDatePickerVisible}
    mode="date"
    display="spinner"
    value={endDate}
    onChange={handleEndDateConfirm}
  />
)}
</View>
</>
)}</View>
   
    <TouchableOpacity style={styles.submitButton} onPress={handleApplyLeave}>
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
const toggleChildSelection = (childId) => {
  if (selectedChildren.includes(childId)) {
    // If already selected, remove from the array
    setSelectedChildren(selectedChildren.filter((id) => id !== childId));
  } else {
    // If not selected, add to the array
    setSelectedChildren([...selectedChildren, childId]);
  }
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
  SelectingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#054f96',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  label:
  {
    marginLeft:90,
    marginRight:90,
    marginBottom:-6,
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    backgroundColor: 'lightgrey',
    borderRadius:80,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  button: {
    backgroundColor: '#475563',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
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
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
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
    color:'white',
   
  },
  selectChild: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white',
    textAlign:'center',
    backgroundColor:'#054f96',
    borderRadius: 10,
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
  },

  applyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white',
    textAlign:'center',
    backgroundColor:'#054f96',
    borderRadius: 10,
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
  },

  leaveItem: {
    marginVertical: 10,
  },
  leaveText: {
    fontSize: 16,
    color:'black',
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
 marginBottom:30,
 height:'6%',
},
closeButtonText: {
  color: 'white',
  textAlign: 'center',
  fontSize: 15,
  fontWeight: 'bold',
},
button: {
  backgroundColor: '#475563',
  padding: 10,
  borderRadius: 5,
  margin: 5,
  flexDirection: 'row',
  justifyContent:'space-between'
},
buttonText: {
  color: 'white',
  textAlign: 'center',
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
 marginTop:10,
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
  paddingLeft:10,
  paddingRight:10                        
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
leaveDaylistContainer:{
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 15,
  margin: 0,
  marginTop: 10,
  marginTop: 10,
  backgroundColor: 'white', 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
externalListConatiner: {
  borderWidth: 1,
  height:'88%',
  borderColor: 'grey',
  borderRadius: 15,
  borderTopRightRadius:0,
  borderTopLeftRadius:0,
  margin: -12,
  marginTop: -9,
  backgroundColor: 'lightgrey', 
  shadowColor: 'black',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
myLeaveDataContainer:{
  
  fontSize: 20,
  fontWeight: 'bold',
  backgroundColor: '#0A2558',
  padding: 6,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  
  color: 'white',
  textAlign: 'center',
  marginTop: 6,
  width: '107.12%', 
  alignSelf: 'center',

},
leaevButtonContainer:
{
paddingRight:30,
paddingLeft:30,
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

});

export default ParentLeave;