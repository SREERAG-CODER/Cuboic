import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/shared/DashboardScreen';
import { OrdersScreen } from '../screens/shared/OrdersScreen';
import { KanbanOrdersScreen } from '../screens/staff/KanbanOrdersScreen';
import { MenuScreen } from '../screens/shared/MenuScreen';
import { DeliveriesScreen } from '../screens/shared/DeliveriesScreen';
import { RobotsScreen } from '../screens/shared/RobotsScreen';
import { PaymentsScreen } from '../screens/shared/PaymentsScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { StaffScreen } from '../screens/owner/StaffScreen';
import { TablesScreen } from '../screens/owner/TablesScreen';
import { AnalyticsScreen } from '../screens/owner/AnalyticsScreen';
import { ManagementScreen } from '../screens/owner/ManagementScreen';
import { COLORS } from '../theme';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabParamList = {
    Dashboard: undefined;
    Orders: undefined;
    Analytics: undefined;
    Manage: undefined;
    Profile: undefined;
};

type ManageStackParamList = {
    ManagementMain: undefined;
    Menu: undefined;
    Staff: undefined;
    Tables: undefined;
    Payments: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MStack = createNativeStackNavigator<ManageStackParamList>();

function ManageStack() {
    return (
        <MStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.bg },
            }}
        >
            <MStack.Screen 
                name="ManagementMain" 
                component={ManagementScreen} 
                options={{ title: 'Manage' }} 
            />
            <MStack.Screen name="Menu" component={MenuScreen} />
            <MStack.Screen name="Staff" component={StaffScreen} />
            <MStack.Screen name="Tables" component={TablesScreen} />
            <MStack.Screen name="Payments" component={PaymentsScreen} />
        </MStack.Navigator>
    );
}

function MainTabs() {
    const { user } = useAuth();
    const isOwner = user?.role === 'Owner';
    const isStaff = user?.role === 'Staff';
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    paddingBottom: Math.max(insets.bottom, 8), // Increased padding
                    paddingTop: 8, // Increased padding
                    paddingLeft: Math.max(insets.left, 0),
                    paddingRight: Math.max(insets.right, 0),
                    height: 64 + insets.bottom, // Slightly taller
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
                    else if (route.name === 'Analytics') iconName = 'bar-chart-2';
                    else if (route.name === 'Manage') iconName = 'settings';
                    else if (route.name === 'Profile') iconName = 'user';

                    return <Feather name={iconName} size={22} color={color} />; // Reduced size from 24 (default size param was likely 24)
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Orders" component={isStaff ? KanbanOrdersScreen : OrdersScreen} />
            {isOwner && (
                <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            )}
            <Tab.Screen name="Manage" component={ManageStack} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
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
