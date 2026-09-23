import { Tabs } from 'expo-router'
import { BookOpen, Home, Library, Search } from 'lucide-react-native'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'

export default function AlunoTabsLayout() {
  const { fontMultiplier } = useAccessibility()
  const insets = useSafeAreaInsets()
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12)
  const tabLabelSize = Math.round(11 * fontMultiplier)
  const tabIconSize = Math.round(23 * fontMultiplier)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a3342',
        tabBarInactiveTintColor: '#5a7282',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#cdd9e3',
          borderTopWidth: 1,
          height: 52 + tabBarBottom,
          paddingBottom: tabBarBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: tabLabelSize,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home color={color} size={tabIconSize} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Library color={color} size={tabIconSize} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="leituras"
        options={{
          title: 'Leituras',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={tabIconSize} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="pesquisa"
        options={{
          title: 'Pesquisa',
          tabBarIcon: ({ color }) => <Search color={color} size={tabIconSize} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  )
}
