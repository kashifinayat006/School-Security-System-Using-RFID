import messaging from '@react-native-firebase/messaging';
import { ref, child, get, getDatabase ,set ,update ,remove } from 'firebase/database';
import { auth ,database} from '../firebase/firebaseconfig';
import { useId } from 'react';


const SendDeviceNotification = (data)=>{

    var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", "key=AAAADYc0YIg:APA91bFLyoy_nchsOqBzoRO5770K-9dGLM4fnkyZKQRD13Hke_opzIEs4UqI0_7hxjtBuEV0yVmaF-SXxITXWiYhRyv2HScpghZavDD2WytaOIrVEUcaHgFpfVTIA9NHesFwG47B3wdV");

var raw = JSON.stringify({
  "data": {"screen" : data.screen},
  "notification": {
    "body": data.body,
    "title": data.title
  },
  "to": data.token
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

}

const getdeviceToken = async (userUid) => {
  try {
    const token = await messaging().getToken();
    console.log("My FCM Token :", token);
    await removeTokenFromDatabase(token);


    // const userUid = 'uLHdoDidpdW7514P4bvgOAzUA452';


    const dbRef = ref(getDatabase());
    // Update the FCM token for the user in the Realtime Database
    const FCMRef = child(dbRef, 'FCMToken/' + userUid+'/'+token);
  
    
    await set(FCMRef ,'');


  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};



const removeTokenFromDatabase = async (tokenToRemove) => {
  try {
    const dbRef = ref(getDatabase());
    const FCMTokenRef = child(dbRef, 'FCMToken');

    // Fetch all user UIDs
    const userUidsSnapshot = await get(FCMTokenRef);
    const userUids = Object.keys(userUidsSnapshot.val() || {});

    // Iterate through each user UID
    for (const userUid of userUids) {
      const userTokensRef = child(FCMTokenRef, userUid);

      // Check if the token exists for the user
      const userTokensSnapshot = await get(userTokensRef);
      const userTokens = userTokensSnapshot.val() || {};

      if (userTokens[tokenToRemove] !== undefined) {
        // Token exists, remove the entire entry
        const tokenRefToRemove = child(userTokensRef, tokenToRemove);
        await remove(tokenRefToRemove);
        console.log(`Token entry removed from user ${userUid}`);
      }
    }
  } catch (error) {
    console.error('Error removing token from database:', error);
  }
};
// Example usage:








export default {SendDeviceNotification ,getdeviceToken ,removeTokenFromDatabase }

