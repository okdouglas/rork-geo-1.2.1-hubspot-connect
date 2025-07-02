import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#1A73E8",
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: "#F8F9FA",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="company/[id]" options={{ title: "Company Details" }} />
      <Stack.Screen name="contact/[id]" options={{ title: "Contact Details" }} />
      <Stack.Screen name="permit/[id]" options={{ title: "Permit Details" }} />
      <Stack.Screen name="workflow/[id]" options={{ title: "Workflow Details" }} />
      <Stack.Screen name="template/[id]" options={{ title: "Template Details" }} />
    </Stack>
  );
}