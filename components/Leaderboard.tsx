
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LeaderboardEntry } from '../types';
import { CloseIcon, TrophyIcon } from './icons';
import { User } from 'firebase/auth';
import { TIME_OPTIONS } from '../constants';

interface LeaderboardProps {
    onClose: () => void;
    currentUser: User | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, currentUser }) => {
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<number>(30);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            setError(null);
            setScores([]);
            try {
                const collectionName = `leaderboard_${selectedTime}s`;
                const q = query(collection(db, collectionName), orderBy("wpm", "desc"), limit(20));
                const querySnapshot = await getDocs(q);
                const leaderboardData = querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
                setScores(leaderboardData);
            } catch (err: any) {
                console.error("Error fetching leaderboard:", err);
                let message = "Could not load leaderboard. Please try again later.";
                const collectionName = `leaderboard_${selectedTime}s`;
                if (err.code === 'permission-denied') {
                    message = `Permission Denied: Please check your Firestore security rules to allow reading the '${collectionName}' collection.`;
                } else if (err.code === 'failed-precondition') {
                    message = `Query requires an index on the '${collectionName}' collection. The error log in your browser's developer console should have a link to create it.`;
                }
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [selectedTime]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <TrophyIcon className="w-16 h-16 text-[#8D6E63] dark:text-amber-400 animate-pulse" />
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</p>;
        }
        if (scores.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">The leaderboard is empty. Be the first to set a score!</p>;
        }

        return (
            <ul className="space-y-3 overflow-y-auto scrollbar-hide flex-grow max-h-[32rem] pr-2">
                {scores.map((score, index) => {
                    const isCurrentUser = currentUser?.uid === score.uid;
                    const rank = index + 1;
                    let rankDisplay;
                    if (rank === 1) rankDisplay = '🥇';
                    else if (rank === 2) rankDisplay = '🥈';
                    else if (rank === 3) rankDisplay = '🥉';
                    else rankDisplay = `#${rank}`;

                    return (
                        <li 
                            key={score.uid} 
                            className={`p-3 rounded-lg flex justify-between items-center text-lg transition-colors ${isCurrentUser ? 'bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400' : 'bg-[#FFF8E1] dark:bg-gray-700'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-2xl w-12 text-center">{rankDisplay}</span>
                                <div className={`relative rounded-full p-0.5 ${score.equippedAchievement?.ringClass || 'ring-transparent'} ring-2 transition-all`}>
                                    <img src={score.photoURL} alt={score.displayName} className="w-12 h-12 rounded-full border-2 border-[#8D6E63] dark:border-gray-500"/>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-2xl">{score.displayName}</span>
                                    {score.equippedAchievement && <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{score.equippedAchievement.name}</span>}
                                </div>
                                {isCurrentUser && <span className="ml-2 text-sm font-bold text-amber-600 dark:text-amber-400">(You)</span>}
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-3xl text-[#4DB6AC] dark:text-teal-400">{score.wpm} WPM</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };
    
    const buttonBaseClasses = "px-6 py-2 text-xl border-2 border-[#8D6E63] rounded-lg transition-all duration-200 focus:outline-none dark:border-gray-400";
    const selectedClasses = "bg-[#8D6E63] text-[#FEF7DC] dark:bg-amber-500 dark:text-gray-900";
    const unselectedClasses = "hover:bg-[#EFEBE9] dark:hover:bg-gray-600";

    return (
        <div className="w-full max-w-3xl bg-[#FEF7DC] dark:bg-gray-800 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-600 relative animate-fade-in">
            <button
                onClick={onClose}
                aria-label="Close leaderboard"
                className="absolute top-4 right-4 p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
            >
                <CloseIcon className="w-8 h-8" />
            </button>
            <div className="flex justify-center items-center gap-4 mb-2">
                <TrophyIcon className="w-12 h-12 text-[#FFCA28] dark:text-amber-400" />
                <h2 className="text-5xl font-bold text-center">Leaderboard</h2>
            </div>
            <div className="flex justify-center gap-4 mb-6">
                {TIME_OPTIONS.map(time => (
                    <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`${buttonBaseClasses} ${time === selectedTime ? selectedClasses : unselectedClasses}`}
                    >
                        {time}s
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default Leaderboard;
