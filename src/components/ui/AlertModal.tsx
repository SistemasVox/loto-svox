// src/components/ui/AlertModal.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FaTimes, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
  /** Caminho para redirecionar (ex.: "/meus-jogos") */
  redirectPath?: string
  /** Texto do botão de redirecionamento (padrão: "Ver Meus Jogos") */
  redirectButtonText?: string
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  redirectPath,
  redirectButtonText = 'Ver Meus Jogos',
}: AlertModalProps) {
  const okButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  // Gerencia foco no botão OK
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => okButtonRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Atalho de teclado (Esc ou Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Bloqueia scroll do body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {/* Backdrop + container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
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
          {/* Cabeçalho */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/30">
                <FaInfoCircle className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300 leading-relaxed">{message}</p>
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

          {/* Ações */}
          <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50">
            <div className="flex gap-3 justify-end">
              {redirectPath && (
                <button
                  onClick={() => {
                    router.push(redirectPath)
                    onClose()
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {redirectButtonText}
                </button>
              )}
              <button
                ref={okButtonRef}
                onClick={onClose}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
