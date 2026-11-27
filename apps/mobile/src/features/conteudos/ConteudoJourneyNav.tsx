import type { ComponentType } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { BookOpen, Lock, MessageCircle } from 'lucide-react-native'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { cn } from '@/lib/cn'

export type ConteudoJourneySection = 'texto' | 'reflexao' | 'comentarios'

interface JourneyStep {
  id: ConteudoJourneySection
  label: string
  icon: ComponentType<{ color: string; size: number; strokeWidth?: number }>
}

interface ConteudoJourneyNavProps {
  steps: JourneyStep[]
  onGo: (section: ConteudoJourneySection) => void
  className?: string
}

export function buildConteudoJourneySteps(options: {
  hasTexto: boolean
  hasReflexao: boolean
}): JourneyStep[] {
  const steps: JourneyStep[] = []
  if (options.hasTexto) {
    steps.push({ id: 'texto', label: 'Ler', icon: BookOpen })
  }
  if (options.hasReflexao) {
    steps.push({ id: 'reflexao', label: 'Refletir', icon: Lock })
  }
  steps.push({ id: 'comentarios', label: 'Comentar', icon: MessageCircle })
  return steps
}

export function ConteudoJourneyNav({ steps, onGo, className }: ConteudoJourneyNavProps) {
  if (steps.length < 2) return null

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className={cn('mt-4', className)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Pressable
              key={step.id}
              onPress={() => onGo(step.id)}
              accessibilityRole="button"
              accessibilityLabel={`Ir para ${step.label}`}
              className="flex-row items-center gap-1.5 rounded-full border border-primary/20 bg-white px-4 py-2 active:bg-primary-light/40"
            >
              <Icon color="#1c756a" size={16} strokeWidth={1.75} />
              <Text className="font-sans-semibold text-sm text-primary">{step.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}