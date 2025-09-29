import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

type Props = {
  onAuthSuccess: () => void;
};

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    authenticate();
  }, []);

  async function authenticate() {
    setIsChecking(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert("Error", "Device not compatible with biometric auth");
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Error", "No biometrics/PIN enrolled on this device");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Book App',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        onAuthSuccess();
      } else {
        Alert.alert("Failed", "Authentication failed, try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Authentication error occurred");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isChecking ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>Please authenticate to continue</Text>
          <Button title="Try Again" onPress={authenticate} />
        </>
      )}
    </View>
  );
}
