import messaging from '@react-native-firebase/messaging';
import { ref, get, getDatabase, child ,onValue } from 'firebase/database';
import { database } from '../firebase/firebaseconfig';
import { useState } from 'react';
import NotificationServices from './NotificationServices';

const ManaualAttendanceStudentData = (absentStudentList) => {

  // console.log("Absent Student List is: " + absentStudentList);

  // Assuming your Realtime Database structure is something like this:
  const securityOfficerProfileRef = ref(database, 'SecurityOfficerProfile');

  // Use the get function to retrieve all data under 'SecurityOfficerProfile'
  get(securityOfficerProfileRef).then((snapshot) => {
    if (snapshot.exists()) {
      const securityOfficerData = snapshot.val();
      console.log('Security Officer Data:', securityOfficerData);




      if (absentStudentList.length != 0) {
        getSecurityOfficerFCMToken(securityOfficerData.uid, absentStudentList)
        getParentFCMToken(absentStudentList)

      }


      // Now you have access to all data under 'SecurityOfficerProfile'
    } else {
      console.log('No data found under SecurityOfficerProfile');
    }
  });
};



const AbsentStudentsData = (absentStudentList, scannedCardAbsentStudentList) => {

  // console.log("Absent Student List is: " + absentStudentList);

  // Assuming your Realtime Database structure is something like this:
  const securityOfficerProfileRef = ref(database, 'SecurityOfficerProfile');

  // Use the get function to retrieve all data under 'SecurityOfficerProfile'
  get(securityOfficerProfileRef).then((snapshot) => {
    if (snapshot.exists()) {
      const securityOfficerData = snapshot.val();
      console.log('Security Officer Data:', securityOfficerData);




      if (scannedCardAbsentStudentList.length != 0) {
        getSecurityOfficerFCMToken(securityOfficerData.uid, scannedCardAbsentStudentList)
        getParentFCMToken(absentStudentList)

      }
      else {
        getParentFCMToken(absentStudentList)

      }







      // Now you have access to all data under 'SecurityOfficerProfile'
    } else {
      console.log('No data found under SecurityOfficerProfile');
    }
  });
};


const getSecurityOfficerFCMToken = (uid, absentStudentList) => {
  const fcmTokenRef = ref(database, 'FCMToken');

  get(child(fcmTokenRef, uid)).then((snapshot) => {
    console.log("Security Officer snap :" + snapshot)
    if (snapshot.exists()) {
      const fcmTokensData = snapshot.val();

      Object.keys(fcmTokensData).forEach((token) => {
        // Loop through absent students and send notifications for each
        absentStudentList.forEach((student) => {
          if (checkLeaveStudent(student.id ,student.class ,student.date) != 'Leave') {
          sendNotification(token, { title: 'CSA Alert', body: `${student.firstName} ${student.lastName} RFID card is scanned (ID: ${student.id}), but during attendance ${student.firstName} ${student.lastName} is not present in class ${student.class}. Please investigate.` }, 'SecurityNotification');
          }
        });
      });
    } else {
      console.log('No FCM tokens found for UID ' + uid);
    }
  });
};

const getParentFCMToken = (abentstudentList) => {





  console.log('Absent List of Parent: ' + JSON.stringify(abentstudentList))
  const fcmTokenRef = ref(database, 'FCMToken');
  abentstudentList.forEach((student) => {
    if (checkLeaveStudent(student.id ,student.class ,student.date) != 'Leave') {
      get(child(fcmTokenRef, student.cnic)).then((snapshot) => {
        if (snapshot.exists()) {
          const fcmTokensData = snapshot.val();

          Object.keys(fcmTokensData).forEach((token) => {
            // Loop through absent students and send notifications for each

            sendNotification(token, { title: 'Absentee Notification', body: `Your child, ${student.firstName} ${student.lastName}, was absent today.` }, 'ParentAttendance');

          });
        } else {
          console.log('No FCM tokens found for CNIC :' + student.cnic);
        }
      });
    }
  });









}

const checkLeaveStudent = (id ,cl ,currentDate) => {


  const dbRef = ref(getDatabase());
  const attendanceRef = child(dbRef, `AttendanceRecord/StudentAttendance/${cl}/${currentDate}/${id}`);

  var status = '';
  onValue(attendanceRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      // console.log('Enternal :' ,data.attendanceStatus)
      status = data.attendanceStatus;

    } else {
      console.log('No data available');

    }
  });

  return status




}


const sendNotification = async (token, data, screen) => {


  let notificationdata = {
    title: data.title,
    body: data.body,
    token: token,
    screen: screen,

  }

  await NotificationServices.SendDeviceNotification(notificationdata)

}

export default { AbsentStudentsData, ManaualAttendanceStudentData };
