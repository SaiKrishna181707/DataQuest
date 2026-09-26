import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../api';
import './Quests.css';

const formatStatus = (status) => (status || '').replace('_', ' ');

const QuestDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [userInfo] = useOutletContext();
  const [quest, setQuest] = useState(location.state?.quest || null);
  const [isLoading, setIsLoading] = useState(!location.state?.quest);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadQuest = useCallback(async () => {
    try {
      const { data } = await api.get(`/quests/${id}`);
      setQuest(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setQuest(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadQuest();
  }, [loadQuest]);

  if (isLoading) {
    return <div className="quest-details">Loading quest...</div>;
  }

  if (!quest) {
    return (
      <div className="quest-details">
        <h2>Quest not found</h2>
        <p>This quest may have been removed.</p>
        <Link to="/browse_quests">Back to quests</Link>
      </div>
    );
  }

  const creatorId = quest.creator?._id || quest.creator;
  const participants = quest.participants || [];
  const isCreator = String(creatorId) === String(userInfo._id);
  const hasJoined = participants.some(
    (participant) => String(participant?._id || participant) === String(userInfo._id)
  );

  const toggleMembership = async () => {
    setIsUpdating(true);
    try {
      const { data } = await api.post(`/quests/${id}/${hasJoined ? 'leave' : 'join'}`);
      toast.success(data.message);
      await loadQuest();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="quest-details">
      <h2>{quest.title}</h2>
      <h3>Category: {quest.category}</h3>
      <p className="quest-status">Status: {formatStatus(quest.status)}</p>
      {quest.location && <p className="quest-location">Location: {quest.location}</p>}
      <p className="quest-creator">
        Created by {quest.creator?.username || 'an unknown researcher'} on{' '}
        {new Date(quest.createdAt).toLocaleDateString()}
      </p>
      <p className="quest-description">{quest.description}</p>
      <p className="quest-participants">
        Contributors: {participants.length}
        {participants.length > 0 &&
          ` (${participants.map((participant) => participant.username).filter(Boolean).join(', ')})`}
      </p>
      {isCreator ? (
        <p className="quest-owner-note">You created this quest.</p>
      ) : (
        <button className="cta" onClick={toggleMembership} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : hasJoined ? 'Leave this quest' : 'Join this quest'}
        </button>
      )}
      <p>
        <Link to="/browse_quests">Back to all quests</Link>
      </p>
    </div>
  );
};

export default QuestDetails;