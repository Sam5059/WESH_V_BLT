import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface LocationContextType {
  currentLocation: string;
  setCurrentLocation: (location: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [currentLocation, setCurrentLocationState] = useState<string>('16-Alger');

  useEffect(() => {
    loadSavedLocation();
  }, []);

  useEffect(() => {
    if (profile?.wilaya) {
      setCurrentLocation(profile.wilaya);
    }
  }, [profile?.wilaya]);

  const loadSavedLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem('currentLocation');
      if (saved) {
        setCurrentLocationState(saved);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  const setCurrentLocation = async (location: string) => {
    try {
      setCurrentLocationState(location);
      await AsyncStorage.setItem('currentLocation', location);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
