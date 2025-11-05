import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Messages() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home as this page is deprecated
    router.replace('/(tabs)/');
  }, []);

  return (
    <View style={styles.container}>
      <Text>Redirection...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
