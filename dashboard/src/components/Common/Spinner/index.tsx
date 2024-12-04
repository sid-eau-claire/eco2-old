import React from 'react'
import { twMerge } from 'tailwind-merge'
export default function Spinner({fullscreen = true}:{fullscreen?:boolean}) {
  return (
      <div 
        className={twMerge(`bg-black bg-opacity-50 fixed left-0 right-0 top-0 bottom-0 z-50 flex justify-center items-center `,
          fullscreen ? '' : ' absolute'
        )}
      >
        <img className="h-16 animate-spin" src="/images/eauclaire/logo.svg" alt="Loading"/>
      </div>
  )
}
