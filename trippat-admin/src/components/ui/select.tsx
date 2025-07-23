'use client'

import React, { forwardRef, useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from './utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  onValueChange?: (value: string) => void
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, defaultValue, placeholder = 'Select an option', disabled = false, error = false, className, onValueChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue)
      setIsOpen(false)
      onValueChange?.(optionValue)
    }

    const selectedOption = options.find(option => option.value === selectedValue)

    return (
      <div className={cn('relative', className)} ref={selectRef} {...props}>
        <div
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={cn('block truncate', !selectedOption && 'text-gray-500')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'relative flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50',
                  'focus:bg-gray-50 focus:outline-none',
                  option.disabled && 'cursor-not-allowed opacity-50',
                  selectedValue === option.value && 'bg-primary-50 text-primary'
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                <span className="block truncate">{option.label}</span>
                {selectedValue === option.value && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }