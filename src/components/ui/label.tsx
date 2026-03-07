'use client'

import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export const Label = ({ children, className = "", ...props }: LabelProps) => (
    <label
        className={"text-sm font-medium leading-none mb-2 block text-zinc-700 dark:text-zinc-300 " + className}
        {...props}
    >
        {children}
    </label>
)
