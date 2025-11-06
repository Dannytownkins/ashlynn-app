import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, Timestamp, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Send, Pin } from 'lucide-react';

interface Message {
  id: string;
  from: 'student' | 'parent';
  text: string;
  createdAt: Timestamp | Date;
  reactions?: { emoji: string; from: string }[];
  pinned?: boolean;
}

const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = 'student'; // TODO: Replace with actual user role

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Query messages for today (date field) or all messages if date field doesn't exist yet
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'messages'), {
      from: currentUser,
      text: newMessage.trim(),
      date: today,
      createdAt: serverTimestamp(),
      reactions: [],
      pinned: false,
    });

    setNewMessage('');
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const messageRef = doc(db, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (messageSnap.exists()) {
      const reactions = messageSnap.data().reactions || [];
      const existingIndex = reactions.findIndex((r: any) => r.from === currentUser && r.emoji === emoji);
      
      if (existingIndex >= 0) {
        reactions.splice(existingIndex, 1);
      } else {
        reactions.push({ emoji, from: currentUser });
      }

      await updateDoc(messageRef, { reactions });
    }
  };

  const handlePinMessage = async (messageId: string) => {
    const messageRef = doc(db, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (messageSnap.exists() && currentUser === 'parent') {
      // Unpin all other messages first
      const batch = writeBatch(db);
      messages.forEach((msg) => {
        if (msg.pinned) {
          batch.update(doc(db, 'messages', msg.id), { pinned: false });
        }
      });
      batch.update(messageRef, { pinned: true });
      await batch.commit();
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading messages...</div>;
  }

  const pinnedMessage = messages.find((m) => m.pinned);
  const regularMessages = messages.filter((m) => !m.pinned);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Daily Messages</h2>
        {pinnedMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Pin size={16} className="text-amber-600 mr-2 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">Today's Focus</p>
                <p className="text-slate-700">{pinnedMessage.text}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {regularMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.from === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs sm:max-w-md rounded-lg p-3 ${
                message.from === currentUser
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm mb-2">{message.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex items-center space-x-2 ml-2">
                  {message.reactions?.map((reaction, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleReaction(message.id, reaction.emoji)}
                      className="text-sm hover:scale-110 transition-transform"
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => handleReaction(message.id, '👍')}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, '✅')}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, '⏱️')}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    ⏱️
                  </button>
                  {currentUser === 'parent' && (
                    <button
                      onClick={() => handlePinMessage(message.id)}
                      className="text-xs hover:scale-110 transition-transform ml-1"
                      title="Pin as Today's Focus"
                    >
                      <Pin size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center space-x-2 border-t border-slate-200 pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessagesView;

