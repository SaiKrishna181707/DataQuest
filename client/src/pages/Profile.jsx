import { useEffect, useState } from 'react';
import { Link, useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from '../api';
import './Profile.css';

const Profile = () => {
  const [userInfo] = useOutletContext();
  const [myQuests, setMyQuests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMyQuests = async () => {
      try {
        const { data } = await api.get('/quests/mine');
        if (isMounted) setMyQuests(data.data || []);
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      }
    };

    if (userInfo && userInfo._id) loadMyQuests();

    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  return (
    <div className="profile">
      <div className="profile-header">
        <img src={userInfo.image || '/user.svg'} alt="Avatar" className="profile-avatar" />
        <h2>{userInfo.username}</h2>
        <p>{userInfo.email}</p>
      </div>
      <div className="profile-bio">
        <h3>Bio</h3>
        <p>{userInfo.bio || 'No bio yet.'}</p>
      </div>
      <div className="profile-projects">
        <h3>My Quests</h3>
        {error && <p className="profile-error">{error}</p>}
        <div className="projects-list">
          {myQuests.length > 0 ? (
            myQuests.map((quest) => (
              <Link key={quest._id} to={`/quest/${quest._id}`} className="quest-item">
                <h4>{quest.title}</h4>
                <p>{quest.category}</p>
              </Link>
            ))
          ) : (
            <p>No quests yet. <Link to="/browse_quests">Browse quests</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;