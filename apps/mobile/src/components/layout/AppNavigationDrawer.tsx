import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, type Href } from 'expo-router'
import { ChevronRight, Type, X } from 'lucide-react-native'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandLogo } from '@/components/auth/BrandLogo'
import { Avatar } from '@/components/ui/Avatar'
import { useAppShell } from '@/components/layout/AppShellProvider'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import {
  DRAWER_ACCOUNT_LINKS,
  DRAWER_CONTENT_LINKS,
  DRAWER_MAIN_LINKS,
  PERFIL_LABELS,
  type DrawerNavItem,
} from '@/features/app/accountMenu'
import { DRAWER_GRADIENT, DRAWER_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { useAuth } from '@/providers/AuthProvider'

const DRAWER_WIDTH = '88%'

export function AppNavigationDrawer() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile } = useAuth()
  const { drawerOpen, closeDrawer, openAccount } = useAppShell()
  const { setModeEnabled } = useAccessibility()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'
  const perfilLabel = profile?.perfil ? PERFIL_LABELS[profile.perfil] : 'Aluno'

  const navigate = (href: string) => {
    closeDrawer()
    router.push(href as Href)
  }

  return (
    <Modal
      visible={drawerOpen}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={closeDrawer}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.52)' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <LinearGradient
            colors={[...DRAWER_GRADIENT]}
            locations={[...DRAWER_GRADIENT_LOCATIONS]}
            style={{
              width: DRAWER_WIDTH,
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingBottom: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <BrandLogo variant="mark" showTagline={false} markSize={40} backdrop="dark" />
                  <View>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#fff' }}>
                      EntreLinhas
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                      Olá, {firstName}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={closeDrawer}
                  accessibilityLabel="Fechar menu"
                  style={{
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <X color="#ffffff" size={20} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, flexGrow: 1 }}
              >
                <DrawerSection title="Menu">
                  {DRAWER_MAIN_LINKS.map((item) => (
                    <DrawerRow key={item.href} item={item} onPress={() => navigate(item.href)} large />
                  ))}
                </DrawerSection>

                <DrawerSection title="Catálogo">
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    {DRAWER_CONTENT_LINKS.map((item) => (
                      <Pressable
                        key={item.href}
                        onPress={() => navigate(item.href)}
                        style={{
                          width: '47%',
                          flexGrow: 1,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: 14,
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.14)',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'PlusJakartaSans_600SemiBold',
                            fontSize: 15,
                            color: '#ffffff',
                          }}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </DrawerSection>

                <DrawerSection title="Sua conta">
                  {DRAWER_ACCOUNT_LINKS.map((item) => (
                    <DrawerRow key={item.href} item={item} onPress={() => navigate(item.href)} />
                  ))}
                  <DrawerRow
                    item={{
                      href: '',
                      label: 'Acessibilidade',
                      hint: 'Texto maior e áudio',
                      icon: Type,
                    }}
                    onPress={() => {
                      closeDrawer()
                      setModeEnabled(true)
                    }}
                  />
                </DrawerSection>

                <LinearGradient
                  colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.14)']}
                  style={{
                    marginTop: 8,
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.9)',
                      lineHeight: 20,
                    }}
                  >
                    Leitura que transforma — explore, escreva e evolua na sua jornada.
                  </Text>
                  {profile ? (
                    <Pressable
                      onPress={() => {
                        closeDrawer()
                        openAccount()
                      }}
                      style={{
                        marginTop: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        padding: 10,
                      }}
                    >
                      <Avatar name={profile.nome} size={36} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#fff' }}
                          numberOfLines={1}
                        >
                          {profile.nome}
                        </Text>
                        <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                          {perfilLabel} · Ver conta
                        </Text>
                      </View>
                      <ChevronRight color="rgba(255,255,255,0.7)" size={16} />
                    </Pressable>
                  ) : null}
                </LinearGradient>
              </ScrollView>
            </View>
          </LinearGradient>

          <Pressable style={{ flex: 1 }} onPress={closeDrawer} accessibilityLabel="Fechar menu" />
        </View>
      </View>
    </Modal>
  )
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}

function DrawerRow({
  item,
  onPress,
  large = false,
}: {
  item: DrawerNavItem
  onPress: () => void
  large?: boolean
}) {
  const Icon = item.icon
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: large ? 12 : 10,
        paddingHorizontal: 4,
      }}
    >
      <View
        style={{
          height: 36,
          width: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <Icon color="#ffffff" size={18} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: large ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_600SemiBold',
            fontSize: large ? 20 : 16,
            color: '#ffffff',
          }}
        >
          {item.label}
        </Text>
        {item.hint ? (
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 12,
              color: 'rgba(255,255,255,0.62)',
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            {item.hint}
          </Text>
        ) : null}
      </View>
      <ChevronRight color="rgba(255,255,255,0.45)" size={16} />
    </Pressable>
  )
}
