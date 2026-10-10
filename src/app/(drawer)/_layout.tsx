import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerPosition: 'right',
        headerTitleAlign: 'left',
      }}>
      <Drawer.Screen name="index" options={{ title: 'Pastiya', drawerLabel: 'Medications' }} />
      <Drawer.Screen name="history" options={{ title: 'Dose history', drawerLabel: 'Dose history' }} />
    </Drawer>
  );
}
