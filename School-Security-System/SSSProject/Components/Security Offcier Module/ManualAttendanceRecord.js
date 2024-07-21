import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ref, onValue, getDatabase, get } from 'firebase/database';
import { database } from '../../firebase/firebaseconfig';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from "@react-native-community/datetimepicker";


const HeaderTop = () => {
    return (
        <View style={styles.headerTop}>
            <Text style={styles.headerText}>Security Officer Account</Text>
        </View>
    );
};

const ManaualAttendanceRecord = (props) => {
    const [manualAttendanceData, setManualAttendanceData] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [noRecordMessage, setNoRecordMessage] = useState('');

    useEffect(() => {
        fetchData()
    }, [selectedDate])

    const fetchData = async () => {
        setNoRecordMessage('');
        setManualAttendanceData([])
        const formattedDate = formatDate(selectedDate);
        console.log('date is' + formattedDate)


        const classAttendanceRef = ref(getDatabase(), `AttendanceRecord/StudentAttendance/`);

        try {
            const snapshot = await get(classAttendanceRef);
            if (snapshot.exists()) {
                const allClasses = snapshot.val();
                const matchingStudents = [];

                for (const classKey in allClasses) {
                    const classData = allClasses[classKey];

                    if (classData[formattedDate]) {
                        const idData = classData[formattedDate];

                        for (const studentId in idData) {
                            const studentData = idData[studentId];

                            if (studentData.type === 'Manual') {
                                const matchingStudent = {
                                    class: classKey,
                                    date: formattedDate,
                                    id: studentId,
                                    ...studentData,
                                };

                                matchingStudents.push(matchingStudent);
                            }
                        }
                    }
                }



                if (matchingStudents.length > 0) {

                    setManualAttendanceData(matchingStudents);
                    console.log("Final Data:", JSON.stringify(matchingStudents));
                    //   setIsDataLoaded(true);
                } else {
                      setNoRecordMessage("No attendance records found for the selected date.");


                }
            } else {
                setNoRecordMessage("No attendance records found for the selected date.");


            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

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

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}-${month}-${year}`;
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
                <Text style={styles.headingTitle}>Manual Attendance Records</Text>
                
            </View>
            <GradientButton title="Select Date" onPress={showDatepicker} />
            {!noRecordMessage ? (
            <FlatList
                data={manualAttendanceData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>Date: {item.date}</Text>
                        <Text style={styles.itemText}>Student ID: {item.id}</Text>
                        <Text style={styles.itemText}>
                            Student Name: {item.firstName} {item.lastName}
                        </Text>
                        <Text style={styles.itemText}>Class: {item.class}</Text>
                        <Text style={styles.itemText}>Teacher: {item.teachername}</Text>
                        {/* Add other necessary fields here */}
                    </View>
                )}
            />
            ) : (
                <Text style={styles.noRecordMessage}>{noRecordMessage}</Text>
              )}
            
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
        // justifyContent: 'flex-end', // Align child elements at the bottom
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
    headerText: {
        color: 'white', // White color for the header text
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 20,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    button: {
       marginTop:20,
        padding: 10,
        borderRadius: 15,
  
    },
    itemContainer: {
        backgroundColor: '#9cd9e6',
        padding: 10,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 3,
        borderColor: '#25555e',
        
    },
    itemText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333333',
    },
    noRecordMessage: {
        textAlign: 'center',
        marginTop: 70,
        fontSize: 16,
        color: 'gray',
      },
      headingContainer: {
        backgroundColor: 'transparent',
        padding: 10,
        marginTop: 10,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth:0.5,
        borderColor:'black'
      },
      headingTitle: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
});

export default ManaualAttendanceRecord;
