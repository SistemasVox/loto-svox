// src/hooks/useConfirmation.ts
'use client'

import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    loading: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const showConfirmation = useCallback((
    options: ConfirmationOptions,
    onConfirm: () => void | Promise<void>
  ) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        isOpen: true,
        loading: false,
        onConfirm: async () => {
          try {
            setState(prev => ({ ...prev, loading: true }))
            await onConfirm()
            setState(prev => ({ ...prev, isOpen: false, loading: false }))
            resolve(true)
          } catch (error) {
            setState(prev => ({ ...prev, loading: false }))
            throw error
          }
        },
        onCancel: () => {
          setState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, loading: false }))
  }, [])

  return {
    confirmationState: state,
    showConfirmation,
    hideConfirmation
  }
}