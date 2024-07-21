import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebase/firebaseconfig';
import DateTimePicker from "@react-native-community/datetimepicker";
const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Security Officer Account</Text>
    </View>
  );
}
const SecurityNotification = (props) => {
  const [scanCardData, setScanCardData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (scanCardData && selectedDate) {
      // Format the selected date to 'dd-mm-yyyy'
      const formattedSelectedDate = `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`;

      // Filter the data based on the formatted selected date and convert it to an array
      const filteredData = scanCardData[formattedSelectedDate] || {};
      const dataArray = Object.entries(filteredData).map(([studentId, studentData]) => ({
        id: studentId,
        ...studentData,
      }));

      console.log('Array Form Data : ' + JSON.stringify(dataArray))


      setFilteredData(dataArray);
    }
  }, [scanCardData, selectedDate]);

  useEffect(() => {
    const dbRef = ref(database, 'ScanCardAbsentStudents');

    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        setScanCardData(snapshot.val());
      } else {
        setScanCardData({});
      }
    };

    onValue(dbRef, handleData);

    // Cleanup subscription on component unmount
    return () => {
      off(dbRef, handleData);
    };
  }, []);

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

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {

    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);


    }
  };

  return (
    <LinearGradient
      colors={['#FFFAF0', '#FFFAF0']}

      start={{ x: 1, y: 2 }}
      end={{ x: 3, y: 1 }}
      style={styles.container}

    >
      <HeaderTop />

      <View style={styles.headingContainer}>
        <Text style={styles.headingTitle}>Student card scanned but absent</Text>
      </View>
      <View style={styles.externalListConatiner}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredData.length > 0 ? (
            filteredData.map((studentData) => (

              <View key={studentData.id} style={styles.studentContainer}>
                <Text style={styles.text}>ID: {studentData.id}</Text>
                <Text style={styles.text}>Class: {studentData.class}</Text>
                <Text style={styles.text}>CNIC: {studentData.cnic}</Text>
                <Text style={styles.text}>Date: {studentData.date}</Text>
                <Text style={styles.text}>First Name: {studentData.firstName}</Text>
                <Text style={styles.text}>Last Name: {studentData.lastName}</Text>
                <Text style={styles.text}>Time: {studentData.time}</Text>
              </View>

            ))
          ) : (<Text >No data for the selected date.</Text>
          )}



        </ScrollView>
      </View>
      <GradientButton title="Select Date" onPress={showDatepicker} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,

    marginTop: 20,
  },
  headerTop: {
    backgroundColor: '#550A35', // Dark blue color for the header
    // Negative margin to extend on the right
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginTop: "-10.3%",
    marginLeft: -20,
    marginRight: -20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headingContainer: {

    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, // Increased padding for better visual balance
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop: 6,
    width: '105%', // Increased width to 80% for a wider appearance
    alignSelf: 'center',


  },
  headingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',

  },
  headerText: {
    color: 'white', // White color for the header text
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  externalListConatiner: {
    borderWidth: 1,
    height: 605,
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    margin: -8,
    marginTop: 0,
    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#FFF', // White background for each date container
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#3498DB', // Blue shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
  },
  date: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3498DB', // Blue text color
  },
  studentContainer: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#D5F5E3', // Light green background color
    shadowColor: '#27AE60', // Green shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
    width: '100%'
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2C3E50', // Dark gray text color
    fontWeight: 'normal', // You can use 'bold', 'normal', '600', etc.
    fontStyle: 'italic', // You can use 'normal', 'italic', etc.
    marginVertical: 8, // Adjust vertical margin
    paddingHorizontal: 12, // Adjust horizontal padding
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 15,
  }
});


export default SecurityNotification;
