import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './Quests.css';

const ACTIVE_STATUSES = ['open', 'in_progress'];

const MyQuests = () => {
  const [userInfo] = useOutletContext();
  const [showCurrentQuests, setShowCurrentQuests] = useState(true);
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadMyQuests = async () => {
      try {
        const { data } = await api.get('/quests/mine');
        if (isMounted) setQuests(data.data || []);
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (userInfo && userInfo._id) loadMyQuests();

    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  const currentQuests = quests.filter((quest) => ACTIVE_STATUSES.includes(quest.status));
  const pastQuests = quests.filter((quest) => !ACTIVE_STATUSES.includes(quest.status));
  const visibleQuests = showCurrentQuests ? currentQuests : pastQuests;

  const renderQuest = (quest) => (
    <div key={quest._id} className="quest-item" onClick={() => navigate(`/quest/${quest._id}`)}>
      <h3>{quest.title}</h3>
      <p>{quest.category}</p>
      <p className="quest-status">{quest.status.replace('_', ' ')}</p>
    </div>
  );

  return (
    <div className="quests">
      <h2>My Quests</h2>
      <div className="toggle-buttons">
        <button
          className={showCurrentQuests ? 'active' : ''}
          onClick={() => setShowCurrentQuests(true)}
        >
          Current Quests
        </button>
        <button
          className={!showCurrentQuests ? 'active' : ''}
          onClick={() => setShowCurrentQuests(false)}
        >
          Past Quests
        </button>
      </div>
      {error && <p className="quests-error">{error}</p>}
      {isLoading ? (
        <p>Loading your quests...</p>
      ) : (
        <div className="quests-grid">
          {visibleQuests.length > 0 ? (
            visibleQuests.map(renderQuest)
          ) : (
            <p>
              You have not joined any {showCurrentQuests ? 'current' : 'past'} quests yet.{' '}
              <Link to="/browse_quests">Browse quests</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyQuests;