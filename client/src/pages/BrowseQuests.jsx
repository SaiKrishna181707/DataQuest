import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './Quests.css';

const BrowseQuests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadQuests = async () => {
      try {
        const { data } = await api.get('/quests');
        if (isMounted) setQuests(data.data || []);
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadQuests();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', ...new Set(quests.map((quest) => quest.category).filter(Boolean))];

  const filteredQuests = quests.filter((quest) => {
    const matchesCategory = selectedCategory === 'All' || quest.category === selectedCategory;
    const matchesSearch = (quest.title || '')
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="quests">
      <h2>Browse Quests</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search quests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="quests-error">{error}</p>}
      {isLoading ? (
        <p>Loading quests...</p>
      ) : (
        <div className="quests-list">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => (
              <div
                key={quest._id}
                className="quest-item"
                onClick={() => navigate(`/quest/${quest._id}`)}
              >
                <h3>{quest.title}</h3>
                <p>{quest.category}</p>
                <p className="quest-status">{quest.status.replace('_', ' ')}</p>
                {quest.creator && <p className="quest-creator">by {quest.creator.username}</p>}
              </div>
            ))
          ) : (
            <p>No quests found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseQuests;