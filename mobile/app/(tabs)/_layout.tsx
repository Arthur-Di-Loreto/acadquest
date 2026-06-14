import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function icon(focused: boolean, active: IoniconsName, inactive: IoniconsName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#16213E', borderTopColor: '#0F3460' },
      tabBarActiveTintColor: '#E94560',
      tabBarInactiveTintColor: '#555',
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) =>
            icon(focused, 'home', 'home-outline')({ color, size }),
        }}
      />
      <Tabs.Screen
        name="clan"
        options={{
          title: 'Clã',
          tabBarIcon: ({ focused, color, size }) =>
            icon(focused, 'shield', 'shield-outline')({ color, size }),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ focused, color, size }) =>
            icon(focused, 'trophy', 'trophy-outline')({ color, size }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) =>
            icon(focused, 'person', 'person-outline')({ color, size }),
        }}
      />
    </Tabs>
  );
}
