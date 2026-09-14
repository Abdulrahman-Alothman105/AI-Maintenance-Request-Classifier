import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppHeader from "../components/AppHeader";
import NewRequestScreen from "../screens/NewRequestScreen";
import RequestsScreen from "../screens/RequestsScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  NewRequest: undefined;
  Requests: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="NewRequest"
      screenOptions={{
        header: () => <AppHeader />,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="NewRequest" component={NewRequestScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
    </Stack.Navigator>
  );
}
