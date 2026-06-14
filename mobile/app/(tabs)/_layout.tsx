import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#16213E', borderTopColor: '#0F3460' },
      tabBarActiveTintColor: '#E94560',
      tabBarInactiveTintColor: '#666',
    }}>
      <Tabs.Screen name="home" options={{ title: 'Início' }} />
      <Tabs.Screen name="clan" options={{ title: 'Clã' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
