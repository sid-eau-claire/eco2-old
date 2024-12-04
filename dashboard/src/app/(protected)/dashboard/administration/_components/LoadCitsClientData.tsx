// File: app/your-component-path/LoadCitsClientData.js

'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PageContainer } from '@/components/Containers'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { loadCitsClientData } from '../_actions/citsClient'

type ClientData = {
  created: number
  updated: number
  skipped: number
  noChangeSkipped: number
  createdClients: string[]
}

export default function LoadCitsClientData() {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleLoadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await loadCitsClientData()
      console.log('Received data:', data);
      setClientData(data)
    } catch (err) {
      console.error('Error in handleLoadData:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  console.log('Current clientData state:', clientData)

  return (
    <PageContainer pageName="Load CITS Client Data">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Trigger action</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLoadData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load CITS Client Data'}
          </Button>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          {clientData && (
            <div className="mt-4">
              <p>Clients Created: {clientData.created}</p>
              <p>Clients Updated: {clientData.updated}</p>
              <p>Clients Skipped (no changes): {clientData.noChangeSkipped}</p>
              <p>Clients Skipped (other reasons): {clientData.skipped}</p>
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-between w-full">
                    Created Clients
                    {isOpen ? <ChevronUpIcon className="h-4 w-4 ml-2" /> : <ChevronDownIcon className="h-4 w-4 ml-2" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <ul className="list-disc pl-5">
                    {clientData.createdClients.map((client, index) => (
                      <li key={index}>{client}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}