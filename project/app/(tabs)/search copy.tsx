import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SearchCopy() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search as this page is deprecated
    router.replace('/(tabs)/search');
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
