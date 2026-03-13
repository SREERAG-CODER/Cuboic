import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/shared/DashboardScreen';
import { OrdersScreen } from '../screens/shared/OrdersScreen';
import { MenuScreen } from '../screens/shared/MenuScreen';
import { DeliveriesScreen } from '../screens/shared/DeliveriesScreen';
import { RobotsScreen } from '../screens/shared/RobotsScreen';
import { PaymentsScreen } from '../screens/shared/PaymentsScreen';
import { COLORS } from '../theme';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabParamList = {
    Dashboard: undefined;
    Orders: undefined;
    Menu: undefined;
    Deliveries: undefined;
    Robots: undefined;
    Payments: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
    const { user } = useAuth();
    const isOwner = user?.role === 'Owner';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    paddingBottom: 4,
                    paddingTop: 4,
                    height: 60,
                },
                tabBarActiveTintColor: COLORS.accent,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabel: ({ color, focused }) => (
                    <Text style={{ color, fontSize: 10, fontWeight: focused ? '700' : '500' }}>
                        {route.name}
                    </Text>
                ),
                tabBarIcon: ({ color, size }) => {
                    let iconName: any = 'circle';
                    if (route.name === 'Dashboard') iconName = 'pie-chart';
                    else if (route.name === 'Orders') iconName = 'list';
                    else if (route.name === 'Menu') iconName = 'book-open';
                    else if (route.name === 'Deliveries') iconName = 'box';
                    else if (route.name === 'Robots') iconName = 'cpu';
                    else if (route.name === 'Payments') iconName = 'credit-card';

                    return <Feather name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Menu" component={MenuScreen} />
            <Tab.Screen name="Deliveries" component={DeliveriesScreen} />
            <Tab.Screen name="Robots" component={RobotsScreen} />
            {isOwner && (
                <Tab.Screen name="Payments" component={PaymentsScreen} />
            )}
        </Tab.Navigator>
    );
}

export function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
                <ActivityIndicator color={COLORS.accent} size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.surface },
                    headerTintColor: COLORS.text,
                    headerTitleStyle: { fontWeight: '700' },
                    contentStyle: { backgroundColor: COLORS.bg },
                }}
            >
                {!user ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
