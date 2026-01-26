'use client'

import Image from 'next/image'

export default function MasPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Image 
        src="/logo.png" 
        alt="Red Patrimonio Chile" 
        width={200} 
        height={200} 
        className="object-contain"
      />
    </div>
  )
}
