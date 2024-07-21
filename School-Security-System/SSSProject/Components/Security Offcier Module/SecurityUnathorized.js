import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet ,TouchableOpacity } from 'react-native';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebase/firebaseconfig';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from "@react-native-community/datetimepicker";
const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Security Officer Account</Text>
    </View>
  );
}
const SecurityUnathorized = (props) => {
  const [unauthorizedData, setUnauthorizedData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState([]);
  

  useEffect(() => {
    if (unauthorizedData && selectedDate) {
      // Format the selected date to 'dd-mm-yyyy'
      const formattedSelectedDate = `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`;

      // Filter the data based on the formatted selected date
      const filteredData = unauthorizedData.filter(item => item.date === formattedSelectedDate);
      setFilteredData(filteredData);
      console.log('filterData',filteredData)
     
    }
  },[selectedDate,unauthorizedData])

  useEffect(() => {
    const unauthorizedRef = ref(database, 'Unauthorized Card Scanned');
    const onData = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let dataArray = Object.keys(data).map((date) => {
          return {
            date,
            entries: Object.values(data[date]),
          };
        });

        // Sort the dataArray by date in descending order
        dataArray = dataArray.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.entries[0].time}`);
          const dateB = new Date(`${b.date} ${b.entries[0].time}`);
          return dateB - dateA;
        });

        // Sort entries within each date by time in descending order
        dataArray.forEach((item) => {
          item.entries = item.entries.sort((a, b) => {
            const timeA = new Date(`${item.date} ${a.time}`);
            const timeB = new Date(`${item.date} ${b.time}`);
            return timeB - timeA;
          });
        });

        setUnauthorizedData(dataArray);
      }
    };

    // Attach the event listener
    onValue(unauthorizedRef, onData);

    // Detach the event listener when the component unmounts
    return () => {
      off(unauthorizedRef, 'value', onData);
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.date}>{`Date: ${item.date}`}</Text>
      <FlatList
        data={item.entries}
        keyExtractor={(entry) => entry.cardID}
        renderItem={({ item: cardEntry }) => (

          cardEntry.inTime !== undefined ?(
          <View style={styles.cardEntry}>
            <Text style={styles.cardID}>{`Card ID: ${cardEntry.cardID}`}</Text>
            <Text style={styles.time}>{`Time: ${cardEntry.inTime}`}</Text>
          </View>
          ):(<></>)

        )}
        contentContainerStyle={styles.innerFlatList}
      />
    </View>
  );

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
      filterData(date);

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
      <Text style={styles.headingTitle}>Unauthorized cards scanned Data</Text>
    </View>
    
    <View style={styles.externalListConatiner}>
    {filteredData.length > 0 ? (
      
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.date}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
        />
      
        ) : (
          <Text style={styles.loadingText}>No data for the selected date.</Text>
        )}
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
     
      justifyContent: 'center',
      alignItems: 'center',
      height: 60,
     marginTop:"-10.3%",
     marginLeft:-20,
     marginRight:-20,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
  },
  headingContainer:{
  
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#0A2558',
    padding: 6, 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
    marginTop:6,
    width: '105%', // width for a wider appearance
    alignSelf: 'center',
    
  
  },
  headingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'white',
  
  },
  headerText: {
    color: 'white', // White color for the header text
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  externalListConatiner: {
    borderWidth: 1,
    height:605,
    borderColor: 'grey',
    borderRadius: 15,
    borderTopRightRadius:0,
    borderTopLeftRadius:0,
    margin: -8,
    marginTop: 0,
    backgroundColor: 'lightgrey', // Light grey background
    shadowColor: 'black',// black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  item: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  cardEntry: {
    marginLeft: 20,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  cardID: {
    fontSize: 16,
    color: '#555555',
  },
  time: {
    fontSize: 14,
    color: '#777777',
  },
  innerFlatList: {
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    marginTop: 10,
    paddingTop: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555555',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
},
button: {
   marginTop:20,
    padding: 10,
    borderRadius: 15,}
});

export default SecurityUnathorized;
