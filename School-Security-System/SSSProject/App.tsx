import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

import SignupScreen from './Authentication/SignupScreen';
import LoginScreen from './Authentication/LoginScreen';
import VerificationMessage from './Authentication/VerifcationMessage';
import ChangePassword from './Authentication/ChangePassword';


import teacherDashboard from './Components/Teacher Module/Dashboard';
import teacherAttendance from './Components/Teacher Module/Attendance';
import WhiteScreen from './Components/Teacher Module/WhiteScreen';
import teacherStudenTable from './Components/Teacher Module/StudentTable';
import teacherNewCard from './Components/Teacher Module/NewCard';
import ResetPassword from './Authentication/ResetPassword';
import ManualAttendance from './Components/Teacher Module/ManualAttendance';
import ViewAttendance from './Components/Teacher Module/ViewAttendance';
import CheckTeacherAttendance from './Components/Teacher Module/CheckTeacherAttendance';
import ApplyLeave from './Components/Teacher Module/ApplyLeave';
import LeaveRequests from './Components/Teacher Module/LeaveRequests';



import ParentDashboard from './Components/Parent Module/ParentDashboard'
import ParentAttendance from './Components/Parent Module/ParentAttendance'
import ParentNewCard from './Components/Parent Module/ParentNewCard'
import ParentCheckStatus from './Components/Parent Module/ParenCheckStatus'
import ParentLeave from './Components/Parent Module/ParentLeave'
import ChildTable from './Components/Parent Module/ChildTable';

import SecurityAbsence from './Components/Security Offcier Module/AbsentStudentAlerts';
import SecurityDashboard from './Components/Security Offcier Module/SecurityDashboard';
import SecurityUnathorized from './Components/Security Offcier Module/SecurityUnathorized';
import ManaualAttendanceRecord from './Components/Security Offcier Module/ManualAttendanceRecord';
const Stack = createNativeStackNavigator();

const MainStack = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('WhiteScreen');
  const [notificationData, setNotificationData] = useState(null);

  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage.notification);
      setNotificationData(remoteMessage.data);
      showAlert(remoteMessage.notification);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      setNotificationData(remoteMessage.data);
      navigation.navigate(remoteMessage.data.screen);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          setInitialRoute(remoteMessage.data.screen);
        }
        setLoading(false);
      });

    return () => {
      unsubscribeOnMessage();
    };
  }, []);

  if (loading) {
    return null;
  }
 
 
  

  return (
   
      <Stack.Navigator initialRouteName={initialRoute} >
        <Stack.Screen name="WhiteScreen" component={WhiteScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerificationMessage" component={VerificationMessage} options={{ headerShown: false }} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />

        <Stack.Screen name="teacherDashboard" component={teacherDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="teacherAttendance" component={teacherAttendance} options={{ headerShown: false }} />
        <Stack.Screen name="teacherStudentTable" component={teacherStudenTable} options={{ headerShown: false }} />
        <Stack.Screen name="teacherNewCard" component={teacherNewCard} options={{ headerShown: false }} />
        <Stack.Screen name="Reset Password" component={ResetPassword} options={{ headerShown: false }} />
        <Stack.Screen name="Manual Attendance" component={ManualAttendance} options={{ headerShown: false }} />
        <Stack.Screen name="View Attendance" component={ViewAttendance} options={{ headerShown: false }} />
        <Stack.Screen name="CheckTeacherAttendance" component={CheckTeacherAttendance} options={{ headerShown: false }} />
        <Stack.Screen name="ApplyLeave" component={ApplyLeave} options={{ headerShown: false }} />
        <Stack.Screen name="LeaveRequests" component={LeaveRequests} options={{ headerShown: false }} />
        



        {/* Parent Screens */}
        <Stack.Screen name="ParentDashboard" component={ParentDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="ParentAttendance" component={ParentAttendance} options={{ headerShown: false }} />
        <Stack.Screen name="ParentNewCard" component={ParentNewCard} options={{ headerShown: false }} />
        <Stack.Screen name="ParentLeave" component={ParentLeave} options={{ headerShown: false }} />
        <Stack.Screen name="ParentCheckStatus" component={ParentCheckStatus} options={{ headerShown: false }} />
        <Stack.Screen name="ChildTable" component={ChildTable} options={{headerShown: false}}/>
        {/* Security Officer rrr*/}

        <Stack.Screen name="SecurityAbsence" component={SecurityAbsence} options={{ headerShown: false }} />
        <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="SecurityUnathorized" component={SecurityUnathorized} options={{ headerShown: false }} />
        <Stack.Screen name="ManualAttendanceRecord" component={ManaualAttendanceRecord} options={{ headerShown: false }} />
    
   
      </Stack.Navigator>
   
  );
}

const showAlert = notification  => {
  Alert.alert(
    notification.title,
    notification.body,
    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    { cancelable: false }
  );
};



function App() {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

export default App;