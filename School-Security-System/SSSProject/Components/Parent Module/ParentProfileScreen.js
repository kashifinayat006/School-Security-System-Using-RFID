import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, ScrollView, TouchableOpacity, Alert, ActivityIndicator, BackHandler } from 'react-native';
import Icon2 from 'react-native-vector-icons/Fontisto';
import Icon3 from 'react-native-vector-icons/AntDesign';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, child, getDatabase, onValue, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import { storage } from '../../firebase/firebaseconfig'; // Replace with your firebase config
import ImagePicker from 'react-native-image-crop-picker';


const HeaderTop = () => {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerText}>Parent Account</Text>
    </View>
  );
}

const ProfileScreen = (props) => {
  const [userUid, setUserUid] = useState('');
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [image , setImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScXyoZXpAWph9Vnu9_ZpWgNmn20W4hlBOn-5dLmFQuww8zSfnhRRNQW7B0RRuApO_PFwg&usqp=CAU');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dummyImage ,setDummyImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScXyoZXpAWph9Vnu9_ZpWgNmn20W4hlBOn-5dLmFQuww8zSfnhRRNQW7B0RRuApO_PFwg&usqp=CAU')

  useEffect(() => {
        
    UID();
  }, [image]);

const UID = async () => {
    try {
      const sessionString = await AsyncStorage.getItem('userSession');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const { uid } = session;
        setUserUid(uid);
        getName(uid); // Pass the UID to getClass
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
        setImage(snapshot.val().imageUrl);

        // Call displayStudents with the class information
        
      } else {
        console.log("No data available");
      }

       // Stop loading when data is fetched
    });
  }
  const saveImageUrlToDatabase = async (imageUrl) => {
    const dbRef = ref(getDatabase());
    const teacherRef = child(dbRef, `FatherData/${userUid}`);
    update(teacherRef, { imageUrl: imageUrl })
  }

  const logOut = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userSession');
              console.log('Data with key has been removed.');
              props.navigation.replace('Login');
            } catch (error) {
              console.error('Error removing data:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const uploadImageToFirebase = async (imageUri) => {


    

    const storageRefPath = storageRef(storage, `profile_images/${userUid}`);
    const imageBlob = await fetch(imageUri).then((response) => response.blob());

    setIsUploading(true);

    try {
      await uploadBytes(storageRefPath, imageBlob);
      const imageUrl = await getDownloadURL(storageRefPath);
      console.log('Firebase Storage Image URL:', imageUrl);
      saveImageUrlToDatabase(imageUrl);
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const openImageLibrary = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
  
      toggleModal();
      uploadImageToFirebase(image.path);
    } catch (error) {
      console.log('Error selecting image from library:', error);
    }


   
  };

  const openCamera = async () => {

    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
  
      toggleModal();
      uploadImageToFirebase(image.path);
    } catch (error) {
      console.log('Error capturing image from camera:', error);
    }
 
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };



  return (
    <ScrollView>
      
      <LinearGradient
        colors={['#FFFAF0', '#FFFAF0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <HeaderTop />
        <View style={styles.imageView}>
          <Image
            source={{ uri: image == undefined ? dummyImage : image }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.uploadIcon}
            onPress={toggleModal}
          >
            <FontAwesomeIcon name="upload" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{fname} {lname}</Text>
        <View style={styles.listContainer}>
          <TouchableHighlight
            style={styles.listItem}
            underlayColor="#DDDDDD"
            onPress={() => {
              props.navigation.navigate('ChangePassword')
            }}
          >
            <View style={styles.listItemContent}>
              <Icon2 color={'white'} name="locked" type="material" size={25} />
              <Text style={{ color: 'white' }} > Change Password</Text>
            </View>
          </TouchableHighlight>
        
          <TouchableHighlight
            style={{ paddingVertical: 10, }}
            underlayColor="#DDDDDD"
            onPress={logOut}
          >
            <View style={styles.listItemContent}>
              <Icon3 color={'red'} name="logout" type="material" size={25} />
              <Text style={{ color: 'red', }}> Logout</Text>
            </View>
          </TouchableHighlight>
        </View>

        {/* Modal for Image Upload Options */}
        <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.modalButton}
          onPress={openCamera}
        >
          <Text style={styles.modalButtonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={openImageLibrary}
        >
          <Text style={styles.modalButtonText}>Open Library</Text>
        </TouchableOpacity>
      </Modal>

        {/* Spinner */}
        {isUploading && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#7D0552" />
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: 800,
  },
  headerTop: {
    backgroundColor: '#550A35',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 60,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 12,
    overflow: 'hidden',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    color: 'black',
  },
  listContainer: {
    width: '96%',
    borderRadius: 10,
    backgroundColor: '#7D0552',
    height: 'auto',
    margin: 7,
  },
  listItem: {
    borderBottomWidth: 1,
    borderColor: '#a0a7b0',
    paddingVertical: 10,
    margin: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
  },
  uploadIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
  },
  imageView: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#7D0552',
    marginTop: 5,
  },
  // Modal styles
  modalContainer: {
    position: 'absolute',
    backgroundColor: '#808a7f',
    padding: 20,
    borderRadius: 10,
    top: '55%',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height:'40%',

    
  },
  modalButton: {
    backgroundColor: '#7D0552',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    width:'90%'
  },
  modalButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Spinner styles
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});

export default ProfileScreen;
