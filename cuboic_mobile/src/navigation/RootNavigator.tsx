import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
import { S } from '../theme';

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
    const { colors } = useTheme();
    return (
        <MStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
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
    const { colors } = useTheme();
    const isOwner = user?.role === 'Owner';
    const isStaff = user?.role === 'Staff';
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 8,
                    paddingLeft: Math.max(insets.left, 0),
                    paddingRight: Math.max(insets.right, 0),
                    height: 64 + insets.bottom,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textDim,
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

                    return <Feather name={iconName} size={22} color={color} />;
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
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
                <ActivityIndicator color={colors.accent} size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontWeight: '700' },
                    contentStyle: { backgroundColor: colors.bg },
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
