import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY em apps/mobile/.env',
  )
}

/** Na develop: RN nativo precisa persistir; web/SSR do Metro só com `window`. */
function canPersistAuth(): boolean {
  if (Platform.OS === 'ios' || Platform.OS === 'android') return true
  return typeof window !== 'undefined'
}

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
}

const secureStoreAdapter = {
  getItem: async (key: string) => {
    if (!canPersistAuth()) return null
    try {
      return await SecureStore.getItemAsync(key, secureStoreOptions)
    } catch {
      return AsyncStorage.getItem(key)
    }
  },
  setItem: async (key: string, value: string) => {
    if (!canPersistAuth()) return
    try {
      await SecureStore.setItemAsync(key, value, secureStoreOptions)
    } catch {
      await AsyncStorage.setItem(key, value)
    }
  },
  removeItem: async (key: string) => {
    if (!canPersistAuth()) return
    try {
      await SecureStore.deleteItemAsync(key, secureStoreOptions)
    } catch {
      await AsyncStorage.removeItem(key)
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: canPersistAuth(),
    persistSession: canPersistAuth(),
    detectSessionInUrl: false,
  },
})