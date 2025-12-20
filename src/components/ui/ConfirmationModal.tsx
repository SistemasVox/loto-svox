// src/components/ui/ConfirmationModal.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && !loading) {
        onConfirm()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        if (document.activeElement === confirmButtonRef.current) {
          cancelButtonRef.current?.focus()
        } else {
          confirmButtonRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onConfirm, loading])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FaTrash className="text-red-400" />,
          iconBg: 'bg-red-900/30',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-700/50'
        }
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-yellow-400" />,
          iconBg: 'bg-yellow-900/30',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-700/50'
        }
      default:
        return {
          icon: <FaExclamationTriangle className="text-blue-400" />,
          iconBg: 'bg-blue-900/30',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-700/50'
        }
    }
  }

  const styles = getTypeStyles()

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative bg-gradient-to-br from-gray-900 to-gray-800 border ${styles.border} rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg}`}>
                {styles.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50">
            <div className="flex gap-3 justify-end">
              <button
                ref={cancelButtonRef}
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg font-medium transition-all focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.confirmBtn}`}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}