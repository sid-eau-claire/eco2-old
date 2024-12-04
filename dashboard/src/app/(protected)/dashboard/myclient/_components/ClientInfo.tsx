import React, { useEffect, useState } from 'react'
import { getClientById, getProvinces, updateClient } from '../_actions/client'
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { getNewCasesByClientId } from '../_actions/newcase'
import { getOpportunityByClientId } from '../_actions/opportunities'
import { Loader } from '@/components/Common'
import { Client, Province, PersonProps } from './types'
import ClientTab from './ClientTab'  // Import the new ClientTab component

export default function Person({ personId, onClose, profileId }: PersonProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [newCases, setNewCases] = useState<any[]>([])
  const [allNotes, setAllNotes] = useState<any[]>([])
  const [refresh, setRefresh] = useState(0)

  const fetchData = async () => {
    if (!personId) return
    setLoading(true)
    try {
      const [fetchedClient, fetchedProvinces, fetchedOpportunities, fetchedNewCases] = await Promise.all([
        getClientById(personId),
        getProvinces(),
        getOpportunityByClientId(personId),
        getNewCasesByClientId(personId)
      ])
      
      setClient(fetchedClient || null)
      setProvinces(fetchedProvinces)
      setOpportunities(fetchedOpportunities)
      setNewCases(fetchedNewCases)
      
      const notes = fetchedOpportunities.flatMap((opp: any) => opp.notes)
      setAllNotes(notes)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [personId, profileId, refresh])

  const handleUpdateSuccess = async () => {
    await fetchData()
  }

  if (loading) return <Loader />
  if (!client) return <div className="p-4">No client found</div>

  // Calculate current metrics for PerformanceIndicators
  const currentMetrics = {
    revenue: newCases.reduce((total, c) => total + (c.totalEstFieldRevenue || 0), 0),
    premium: newCases.reduce((total, c) => total + (c.totalAnnualPremium || 0), 0),
    cases: newCases.length,
    opportunities: opportunities.length,
  };
  return (
    <>
      <div className="flex justify-end items-center mb-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <ClientTab 
        client={client}
        provinces={provinces}
        opportunities={opportunities}
        newCases={newCases}
        onUpdateSuccess={handleUpdateSuccess}
        setRefresh={setRefresh}
        profileId={profileId}
        currentMetrics={currentMetrics}
      />
    </>
  )
}