import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Client } from './types'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { PlusCircle, ChevronDown } from 'lucide-react'
import {GoogleCalendar} from '@/components/Calendar'
import { useRouter } from 'next/navigation'

interface PersonRelatedProps {
  client: Client
  opportunities: any[]
  newCases: any[]
  profileId: string
}

interface Note {
  id: number
  content: string
  createTime: string
  source: 'client' | 'opportunity'
}

interface File {
  id: string
  name: string
  createTime: string
  source: 'client' | 'opportunity'
}

interface CalendarEvent {
  id: string
  title: string
  date: string
}

export default function PersonRelated({ client, opportunities, newCases, profileId }: PersonRelatedProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [totalWon, setTotalWon] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [allNotes, setAllNotes] = useState<Note[]>([])

  useEffect(() => {
    // Calculate Total Won
    const totalWonValue = newCases.reduce((sum, nc) => sum + (nc.totalEstFieldRevenue || 0), 0);
    setTotalWon(totalWonValue);

    // Calculate Win Rate
    const totalCases = newCases.length;
    const wonCases = newCases.filter(nc => nc.status === "Paid Settled" || nc.status === "Pending Pay").length;
    const winRateValue = totalCases > 0 ? (wonCases / totalCases) * 100 : 0;
    setWinRate(winRateValue);

    // Consolidate and sort notes
    const clientNotes = (client.notes || []).map(note => ({
      ...note,
      source: 'client' as const
    }));
    const opportunityNotes = opportunities.flatMap(opp => 
      (opp.notes || []).map((note: any) => ({
        ...note,
        source: 'opportunity' as const
      }))
    );
    const sortedNotes = [...clientNotes, ...opportunityNotes].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
    setAllNotes(sortedNotes);

    // Consolidate and sort files
    const clientFiles = (client.documents || []).map(doc => ({
      id: doc.id,
      name: doc.title,
      createTime: doc.createTime,
      source: 'client' as const
    }));
    const opportunityFiles = opportunities.flatMap(opp => 
      (opp.documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.title,
        createTime: doc.createTime,
        source: 'opportunity' as const
      }))
    );
    const sortedFiles = [...clientFiles, ...opportunityFiles].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
    setFiles(sortedFiles);
  }, [client, opportunities, newCases]);

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now(),
        content: newNoteContent.trim(),
        createTime: new Date().toISOString(),
        source: 'client'
      }
      setAllNotes([newNote, ...allNotes])
      setNewNoteContent('')
      setIsAddingNote(false)
    }
  }

  const handleCreateOpportunity = () => {
    router.push(`/dashboard/mybusiness/opportunity/${profileId}`)
    console.log('Create opportunity')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Won</div>
            <div className="text-2xl font-bold">${totalWon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Win Rate</div>
            <div className="text-2xl font-bold">{winRate.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span>Business Cases ({newCases.length})</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          {newCases.length === 0 ? (
            <p>No business cases yet.</p>
          ) : (
            <ul className="w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              {newCases.map((nc: any, index: number) => (
                <li key={index} className="border-b border-gray-200 last:border-b-0">
                  <Link 
                    href={`/dashboard/mybusiness/newcase/${profileId}/${nc.id}`} 
                    className="block p-3 hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-base font-medium text-blue-600 hover:underline">
                        {nc.appInfo.appNumber}
                        {nc.appInfo.policyAccountNumber && ` - ${nc.appInfo.policyAccountNumber}`}
                      </span>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Type: {nc.caseType}</span>
                        <span>Status: {nc.status}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span>Opportunities ({opportunities.length})</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          {opportunities.length === 0 ? (
            <p>No opportunities yet.</p>
          ) : (
            <ul className="space-y-2">
              {opportunities.map(opp => (
                <li key={opp.id} className="flex justify-between items-center">
                  <Link href={`/dashboard/mybusiness/opportunity/${profileId}/${opp.id}`} className="text-blue-600 hover:underline">
                    {opp.description}
                  </Link>
                  <span className="text-sm text-gray-500">${opp.estAmount.toLocaleString()} - {opp.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Button onClick={handleCreateOpportunity} className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span>Notes ({allNotes.length})</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          {allNotes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {allNotes.map(note => (
                <li key={note.id} className="border-b pb-2">
                  <div className="text-sm text-gray-500">
                    {new Date(note.createTime).toLocaleDateString()} - {note.source}
                  </div>
                  <div>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</div>
                </li>
              ))}
            </ul>
          )}
          {isAddingNote ? (
            <div className="mt-2 space-y-2">
              <Input
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter note content"
              />
              <div className="space-x-2">
                <Button onClick={handleAddNote}>Add Note</Button>
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAddingNote(true)} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span>Files ({files.length})</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          {files.length === 0 ? (
            <p>No files yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.map(file => (
                <li key={file.id} className="flex justify-between items-center">
                  <span>{file.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(file.createTime).toLocaleDateString()} - {file.source}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span>Calendar Events ({events.length})</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          <GoogleCalendar />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}