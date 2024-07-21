import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Octicons';

import Home from './ParentHome';
import Profile from './ParentProfileScreen';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
     
    <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarShowLabel: false,
     
      tabBarStyle: styles.tabBarStyle,
      
     
    })}



    
    >
      <Tab.Screen
      
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ size ,focused}) => ( 
            <View style={focused?styles.activeBtn:styles.inactiveBtn}>
              <Icon name="home" size={20} color={color= 'white'} />

            </View>

            
      
          ),
          headerShown: false,
          
        }}
        

        
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size ,focused}) => (
            <View style={focused?styles.activeBtn:styles.inactiveBtn}>
            <Icon name="person" size={20} color={color= 'white'} />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
    
  );
};


const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor:'#550A35',
    borderTopWidth: 0,
    bottom: 15,
    right: 0,
    left: 0,
    height: 60,
   borderRadius:40,
   borderBottomEndRadius:0,
   borderBottomStartRadius:0,
    marginBottom:-14,
  },
  activeBtn: {
    flex: 1,
    position: 'absolute',
    
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: '#7D0552',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
   
  },
  inactiveBtn: {
    
   
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
