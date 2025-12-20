// src/components/ui/InputModal.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FaTimes, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  inputLabel: string
  inputValue: number
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  inputLabel,
  inputValue,
  onInputChange
}: InputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-700/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/30">
                <FaInfoCircle className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {message}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {inputLabel}
                  </label>
                  <input
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={onInputChange}
                    min="3"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Mínimo: 3, Máximo: 100</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
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
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all focus:ring-2 focus:outline-none focus:ring-blue-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}