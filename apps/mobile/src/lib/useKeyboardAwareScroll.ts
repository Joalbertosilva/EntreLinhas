import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Keyboard,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native'
import type { RefObject } from 'react'

type ScrollTarget = number | 'end' | null

const FIELD_TOP_MARGIN = 100

/** Padding no fim do ScrollView; scroll só quando o campo focado pede. */
export function useKeyboardAwareScroll(
  scrollRef: RefObject<ScrollView | null>,
  scrollViewportRef: RefObject<View | null>,
) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const keyboardHeightRef = useRef(0)
  const scrollTargetRef = useRef<ScrollTarget>(null)
  const scrollOffsetY = useRef(0)
  const scrollViewWindowY = useRef(0)
  const pendingFieldRef = useRef<View | null>(null)

  const performScroll = useCallback(() => {
    const target = scrollTargetRef.current
    const scroll = scrollRef.current
    if (!scroll || target == null) return

    if (target === 'end') {
      scroll.scrollToEnd({ animated: true })
    } else {
      scroll.scrollTo({ y: Math.max(0, target), animated: true })
    }
  }, [scrollRef])

  const scheduleScroll = useCallback(() => {
    performScroll()
    if (Platform.OS === 'ios') {
      setTimeout(performScroll, 320)
    }
  }, [performScroll])

  const updateScrollViewPosition = useCallback(() => {
    scrollViewportRef.current?.measureInWindow((_x: number, y: number) => {
      scrollViewWindowY.current = y
    })
  }, [scrollViewportRef])

  const scrollToFieldY = useCallback(
    (fieldRef: View) => {
      updateScrollViewPosition()

      fieldRef.measureInWindow((_x, fieldY, _w, fieldH) => {
        const kb = keyboardHeightRef.current
        const windowHeight = Dimensions.get('window').height
        const fieldTopInContent = scrollOffsetY.current + (fieldY - scrollViewWindowY.current)

        let targetY = Math.max(0, fieldTopInContent - FIELD_TOP_MARGIN)

        if (kb > 0) {
          const safeBottom = windowHeight - kb - 24
          const fieldBottom = fieldY + fieldH
          if (fieldBottom > safeBottom) {
            targetY = Math.max(targetY, scrollOffsetY.current + (fieldBottom - safeBottom) + 16)
          }
        }

        scrollTargetRef.current = targetY
        scheduleScroll()
      })
    },
    [scheduleScroll, updateScrollViewPosition],
  )

  const scrollFieldIntoView = useCallback(
    (fieldRef: View | null) => {
      if (!fieldRef) return
      pendingFieldRef.current = fieldRef
      scrollToFieldY(fieldRef)
    },
    [scrollToFieldY],
  )

  const scrollTo = useCallback(
    (y: number) => {
      pendingFieldRef.current = null
      scrollTargetRef.current = y
      scheduleScroll()
    },
    [scheduleScroll],
  )

  const scrollToEnd = useCallback(() => {
    pendingFieldRef.current = null
    scrollTargetRef.current = 'end'
    scheduleScroll()
  }, [scheduleScroll])

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetY.current = event.nativeEvent.contentOffset.y
  }, [])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (event) => {
      keyboardHeightRef.current = event.endCoordinates.height
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0
      setKeyboardHeight(0)
      scrollTargetRef.current = null
      pendingFieldRef.current = null
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useEffect(() => {
    if (keyboardHeight > 0 && pendingFieldRef.current) {
      scrollToFieldY(pendingFieldRef.current)
    } else if (keyboardHeight > 0 && scrollTargetRef.current != null) {
      scheduleScroll()
    }
  }, [keyboardHeight, scheduleScroll, scrollToFieldY])

  const scrollPaddingBottom = keyboardHeight > 0 ? keyboardHeight + 24 : 32

  return {
    scrollPaddingBottom,
    scrollTo,
    scrollToEnd,
    scrollFieldIntoView,
    onScroll,
    updateScrollViewPosition,
  }
}
