import React, { useState, useEffect } from 'react';
import { fetchRelationships, fetchProfiles, updateRelationships } from '../_actions/network';
import { ColContainer, RowContainer } from '@/components/Containers';

type Profile = {
  id: string;
  name: string;
};

type NetworkRelationshipProps = {
  profileId: string;
};

type Relationship = {
  id: string;
  profile: Profile;
  split: number;
};

const NetworkRelationship: React.FC<NetworkRelationshipProps> = ({ profileId }) => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfileId, setNewProfileId] = useState<string>('');
  const [newSplit, setNewSplit] = useState<number>(0);

  useEffect(() => {
    // Fetch initial relationships and profiles
    const fetchData = async () => {
      const relData = await fetchRelationships(profileId);
      const profilesData = await fetchProfiles();

      setRelationships(
        relData.map((rel: any) => ({
          id: rel.id,
          profile: {
            id: rel.attributes.childId.id,
            name: `${rel.attributes.childId.firstName} ${rel.attributes.childId.lastName}`,
          },
          split: rel.attributes.commissionSplitFraction,
        }))
      );
      setProfiles(profilesData.map((profile: any) => ({
        id: profile.id,
        name: `${profile.attributes.firstName} ${profile.attributes.lastName}`,
      })));
    };

    fetchData();
  }, [profileId]);

  const handleAddRelationship = () => {
    if (newSplit <= 0 || newSplit > 100) {
      alert('Split percentage must be between 1 and 100.');
      return;
    }
    const totalSplit = relationships.reduce((sum, rel) => sum + rel.split, 0) + newSplit;
    if (totalSplit > 100) {
      alert('Total split percentage cannot exceed 100%.');
      return;
    }

    const newRelationship: Relationship = {
      id: `${new Date().getTime()}`,
      profile: profiles.find(profile => profile.id === newProfileId) as Profile,
      split: newSplit,
    };

    setRelationships([...relationships, newRelationship]);
    setNewProfileId('');
    setNewSplit(0);
  };

  const handleRemoveRelationship = (id: string) => {
    setRelationships(relationships.filter(rel => rel.id !== id));
  };

  const handleSaveChanges = async () => {
    try {
      await updateRelationships(profileId, relationships);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  return (
    <ColContainer cols="1:1:1:1" className="p-4 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Change Direct to</h2>
      <p className="text-yellow-600 mb-4">
        Moving this user under a new user will move them and affect all of their descendants.
      </p>
      {relationships.map((rel, index) => (
        <RowContainer key={index} className="flex items-center mb-2">
          <input
            type="text"
            value={rel.profile.name}
            readOnly
            className="border border-gray-300 p-2 rounded-md mr-2"
          />
          <input
            type="number"
            value={rel.split}
            onChange={e => {
              const newSplit = parseInt(e.target.value, 10);
              setRelationships(relationships.map(r => (r.id === rel.id ? { ...r, split: newSplit } : r)));
            }}
            className="border border-gray-300 p-2 rounded-md w-16 mr-2"
          />
          <button
            onClick={() => handleRemoveRelationship(rel.id)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </RowContainer>
      ))}
      <RowContainer className="flex flex-row justify-between items-center mb-4">
        <select
          value={newProfileId}
          onChange={e => setNewProfileId(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-[10rem] mr-2"
        >
          <option value="" disabled>Select Profile</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={newSplit}
          onChange={e => setNewSplit(parseInt(e.target.value, 10))}
          className="border border-gray-300 p-2 rounded-md w-16 mr-2"
        />
        <button
          onClick={handleAddRelationship}
          className="w-[10rem] bg-blue-500 text-white p-2 rounded-md"
        >
          Add Direct to
        </button>
      </RowContainer>
      <RowContainer className="flex justify-center space-x-4">
        <button
          onClick={handleSaveChanges}
          className="w-[10rem] bg-green-500 text-white p-2 rounded-md"
        >
          Save Changes
        </button>
        <button 
          className="w-[10rem] bg-warning text-white p-2 rounded-md"
        >
          Cancel
        </button>
      </RowContainer>
    </ColContainer>
  );
};

export default NetworkRelationship;
