import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { addNoteToOpportunity } from './../_actions/opportunities';
import styles from '@/app/styles/guill.module.css'; // Adjust the import path as needed

type Note = {
  id: string;
  content: string;
  createdAt: Date;
};

type NotesProps = {
  opportunityId: string;
  notes: Note[];
  onNoteAdded: (note: Note) => void;
};

const Notes: React.FC<NotesProps> = ({
  opportunityId,
  notes,
  onNoteAdded
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = async () => {
    if (newNoteContent.trim()) {
      try {
        const newNote = await addNoteToOpportunity(opportunityId, { content: newNoteContent });
        onNoteAdded(newNote);
        setNewNoteContent('');
      } catch (error) {
        console.error('Failed to add note:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {/* <h2 className="text-xl font-semibold">Notes</h2> */}
      </div>
      
      <div className={`border p-4 rounded-md ${styles.quillWrapper}`}>
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={5}
          className="w-full p-2 border rounded-md"
          placeholder="Write your note here..."
        />
        <div className="mt-2 flex justify-end">
          <Button type='button' onClick={handleAddNote}>Add Note</Button>
        </div>
      </div>

      {notes.map((note) => (
        <div key={note.id} className="border p-4 rounded-md">
          <div dangerouslySetInnerHTML={{ __html: note.content }} />
          <p className="text-sm text-gray-500 mt-2">
            Created at: {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Notes;
