
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, getDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { MultiplayerPlayer, MultiplayerRoom, TestHistoryItem, SoundType, FontSize, LayoutMode, MinimalLayoutWidth } from '../types';
import { UsersIcon, CloseIcon, TrophyIcon } from './icons';
import { User } from 'firebase/auth';
import TypingTest from './TypingTest';
import { useThrottle } from '../hooks/useThrottle';

interface MultiplayerLobbyProps {
    roomId: string;
    user: User;
    onLeaveRoom: () => void;
    playSound: (soundType: SoundType) => void;
    isMuted: boolean;
    toggleMute: () => void;
    showVisualKeyboard: boolean;
    fontSize: FontSize;
    layout: LayoutMode;
    minimalLayoutWidth: MinimalLayoutWidth;
    wordHighlight: boolean;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ roomId, user, onLeaveRoom, playSound, isMuted, toggleMute, showVisualKeyboard, fontSize, layout, minimalLayoutWidth, wordHighlight }) => {
    const [room, setRoom] = useState<MultiplayerRoom | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUiHidden, setIsUiHidden] = useState(false);

    const isHost = room?.hostId === user.uid;

    useEffect(() => {
        if (!roomId) return;
        const roomRef = doc(db, 'rooms', roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoom(docSnap.data() as MultiplayerRoom);
            } else {
                setError('This room no longer exists.');
                setTimeout(() => onLeaveRoom(), 3000);
            }
        }, (err) => {
            console.error("Snapshot error: ", err);
            setError("Connection to room lost.");
        });
        return () => unsubscribe();
    }, [roomId, onLeaveRoom]);

    // Host-authoritative check to end the game
    useEffect(() => {
        if (isHost && room && room.status === 'running') {
            // Fix: Explicitly type `players` to fix type inference issue in the `.every()` call below.
            const players: MultiplayerPlayer[] = Object.values(room.players);
            const allFinished = players.length > 0 && players.every(p => p.status === 'finished');
            
            if (allFinished) {
                const roomRef = doc(db, 'rooms', roomId);
                updateDoc(roomRef, { status: 'finished' });
            }
        }
    }, [room, isHost, roomId]);
    
    const handleLeave = useCallback(async () => {
        if (!room) {
            onLeaveRoom();
            return;
        }
        try {
            const roomRef = doc(db, 'rooms', room.roomId);
            const roomDoc = await getDoc(roomRef); // Get latest state
            
            if (!roomDoc.exists()) {
                 onLeaveRoom();
                 return;
            }

            const currentPlayers = roomDoc.data().players || {};
            const numPlayers = Object.keys(currentPlayers).length;

            if (isHost || numPlayers <= 1) {
                // If the host leaves or the last player leaves, delete the room
                await deleteDoc(roomRef);
            } else {
                // Otherwise, just remove the current player
                await updateDoc(roomRef, { [`players.${user.uid}`]: deleteField() });
            }
        } catch (err) {
            console.error("Error leaving room: ", err);
        } finally {
            onLeaveRoom();
        }
    }, [room, isHost, onLeaveRoom, user.uid]);
    
    // Add a listener to handle leaving when the tab is closed
    useEffect(() => {
        const onUnload = () => {
            handleLeave();
        };
        window.addEventListener('beforeunload', onUnload);
        return () => {
            window.removeEventListener('beforeunload', onUnload);
        };
    }, [handleLeave]);

    const handleStartGame = async () => {
        if (!isHost || !room || Object.keys(room.players).length < 1) return;
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
            status: 'running',
            startTime: Date.now()
        });
    }

    const throttledUpdateProgress = useThrottle(async (progress: { wpm: number; progress: number }) => {
        const roomRef = doc(db, 'rooms', roomId);
        try {
            await updateDoc(roomRef, {
                [`players.${user.uid}.wpm`]: progress.wpm,
                [`players.${user.uid}.progress`]: progress.progress,
                [`players.${user.uid}.status`]: 'typing',
            });
        } catch (e) {
            console.log("Could not update progress, room might be closed.");
        }
    }, 500);

    const handleProgress = useCallback((progress: { wpm: number; accuracy: number; progress: number }) => {
        throttledUpdateProgress(progress);
    }, [throttledUpdateProgress]);

    const handleMultiplayerComplete = useCallback(async (result: Omit<TestHistoryItem, 'timestamp'>) => {
        const roomRef = doc(db, 'rooms', roomId);
        try {
             await updateDoc(roomRef, {
                [`players.${user.uid}.wpm`]: result.wpm,
                [`players.${user.uid}.accuracy`]: result.accuracy,
                [`players.${user.uid}.progress`]: 100,
                [`players.${user.uid}.status`]: 'finished',
            });
        } catch (e) {
            console.error("Multiplayer complete update failed: ", e);
        }
    }, [roomId, user.uid]);


    if (error) {
        return (
            <div className="w-full max-w-2xl bg-[#FEF7DC] dark:bg-gray-800 p-6 rounded-2xl border-2 border-red-500 text-center">
                <h2 className="text-3xl text-red-600 dark:text-red-400">{error}</h2>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="w-full max-w-2xl flex flex-col items-center gap-4">
                <UsersIcon className="w-16 h-16 text-[#8D6E63] dark:text-amber-400 animate-pulse" />
                <p className="text-2xl">Joining room...</p>
            </div>
        );
    }
    
    const players = Object.values(room.players) as MultiplayerPlayer[];
    
    if (room.status === 'running') {
        return (
            <div className="w-full max-w-5xl flex flex-col items-center gap-8">
                <div className="w-full space-y-3">
                    {players.sort((a,b) => b.wpm - a.wpm).map(p => (
                        <div key={p.uid} className="flex items-center gap-4 w-full">
                            <img src={p.photoURL} alt={p.displayName} className="w-10 h-10 rounded-full border-2 border-gray-400" />
                            <div className="flex-grow bg-[#EFEBE9] dark:bg-gray-700 rounded-full h-8 border-2 border-[#8D6E63] dark:border-gray-500 overflow-hidden relative">
                                 <div 
                                    className="bg-[#4DB6AC] dark:bg-teal-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                    style={{ width: `${p.progress}%`}}
                                >
                                 </div>
                                 <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm mix-blend-difference px-2">
                                     {p.displayName} - {p.wpm > 0 ? `${p.wpm} WPM` : ''}
                                 </span>
                            </div>
                        </div>
                    ))}
                </div>

                <TypingTest
                    words={room.words}
                    timeLimit={room.timeLimit}
                    difficulty={room.difficulty}
                    onComplete={handleMultiplayerComplete}
                    onRestart={() => {}} 
                    playSound={playSound}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    showVisualKeyboard={showVisualKeyboard}
                    fontSize={fontSize}
                    onProgress={handleProgress}
                    isMultiplayer={true}
                    startTime={room.startTime}
                    layout={layout}
                    minimalLayoutWidth={minimalLayoutWidth}
                    wordHighlight={wordHighlight}
                    isUiHidden={isUiHidden}
                    setIsUiHidden={setIsUiHidden}
                    // These are not used in multiplayer but need to be passed
                    setDifficulty={() => {}}
                    setTimeLimit={() => {}}
                />
            </div>
        );
    }

    if (room.status === 'finished') {
        const sortedPlayers = players.sort((a, b) => b.wpm - a.wpm);
        return (
             <div className="w-full max-w-3xl bg-[#FEF7DC] dark:bg-gray-800 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-600 relative animate-fade-in">
                 <h2 className="text-5xl font-bold text-center mb-6 flex justify-center items-center gap-3"><TrophyIcon className="w-12 h-12 text-amber-400"/> Race Results</h2>
                 <ul className="space-y-3">
                    {sortedPlayers.map((p, index) => {
                        const rank = index + 1;
                        let rankDisplay;
                        if (rank === 1) rankDisplay = '🥇';
                        else if (rank === 2) rankDisplay = '🥈';
                        else if (rank === 3) rankDisplay = '🥉';
                        else rankDisplay = `#${rank}`;

                        return (
                            <li key={p.uid} className="p-3 rounded-lg flex items-center gap-4 bg-[#FFF8E1] dark:bg-gray-700">
                                <span className="font-bold text-3xl w-12 text-center">{rankDisplay}</span>
                                <img src={p.photoURL} alt={p.displayName} className="w-12 h-12 rounded-full border-2 border-[#8D6E63] dark:border-gray-500"/>
                                <span className="font-semibold text-2xl flex-grow">{p.displayName}</span>
                                <div className="text-right">
                                    <p className="font-bold text-3xl text-[#4DB6AC] dark:text-teal-400">{p.wpm} WPM</p>
                                    <p className="text-gray-500 dark:text-gray-400">{p.accuracy}% Acc</p>
                                </div>
                            </li>
                        );
                    })}
                 </ul>
                 <div className="mt-8 flex justify-center">
                    <button onClick={onLeaveRoom} className="mt-6 px-10 py-4 text-3xl font-bold bg-[#FFCA28] text-[#6D4C41] border-2 border-[#6D4C41] rounded-xl hover:bg-[#FFB300] transition-transform transform hover:scale-105 dark:bg-amber-400 dark:text-gray-800 dark:border-amber-500 dark:hover:bg-amber-500">
                        Back to Profile
                    </button>
                 </div>
             </div>
        );
    }
    
    return (
        <div className="w-full max-w-3xl bg-[#FEF7DC] dark:bg-gray-800 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-600 relative animate-fade-in">
            <button
                onClick={handleLeave}
                aria-label="Leave room"
                className="absolute top-4 right-4 p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
            >
                <CloseIcon className="w-8 h-8" />
            </button>
            
            <div className="text-center mb-6">
                <p className="text-2xl text-gray-500 dark:text-gray-400">Room Code</p>
                <p 
                  className="text-6xl font-bold tracking-widest bg-[#EFEBE9] dark:bg-gray-700 inline-block px-6 py-2 rounded-lg border-2 border-dashed border-[#8D6E63] dark:border-gray-500 cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(room.roomId)}
                  title="Click to copy"
                >
                    {room.roomId}
                </p>
                <p className="text-lg mt-2">Share this code with your friends!</p>
            </div>

            <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
                <h3 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
                    <UsersIcon className="w-8 h-8"/>
                    Players ({players.length})
                </h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide pr-2">
                    {players.map(p => (
                        <li key={p.uid} className="bg-[#FEF7DC] dark:bg-gray-600 p-3 rounded-lg flex items-center gap-4">
                            <img src={p.photoURL} alt={p.displayName} className="w-12 h-12 rounded-full border-2 border-[#8D6E63] dark:border-gray-500"/>
                            <span className="font-semibold text-2xl">{p.displayName}</span>
                            {p.uid === room.hostId && <span className="ml-auto text-sm font-bold text-amber-600 dark:text-amber-400">(Host)</span>}
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-8 flex justify-center">
                {isHost ? (
                     <button 
                        onClick={handleStartGame}
                        disabled={players.length < 1}
                        className="px-12 py-4 text-4xl font-bold bg-[#4DB6AC] text-white border-2 border-[#308d82] rounded-xl hover:bg-[#43a095] transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none dark:bg-teal-500 dark:border-teal-600 dark:hover:bg-teal-600"
                    >
                        Start Game
                    </button>
                ) : (
                    <p className="text-2xl text-center animate-pulse">Waiting for host to start the game...</p>
                )}
            </div>
        </div>
    );
};

export default MultiplayerLobby;
