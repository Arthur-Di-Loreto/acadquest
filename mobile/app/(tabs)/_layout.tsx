import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16213E',
          borderTopColor: '#0F3460',
        },
        tabBarActiveTintColor: '#E94560',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚔️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="clan"
        options={{
          title: 'Clã',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
