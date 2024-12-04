import React from 'react'

export default function Spinner() {
  return (
    <div>
      <div className='bg-tremor-brand-muted/20 fixed left-0 right-0 top-0 bottom-0 z-50 flex justify-center items-center'>
        <img className="h-24" src="/images/eauclaire/spinner.svg" alt="Loading"/>
      </div>
    </div>
  )
}
