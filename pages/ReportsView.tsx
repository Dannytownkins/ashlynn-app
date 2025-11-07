
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session, Subject, SessionType } from '../types';
import * as api from '../services/mockApi';

const ReportsView: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [sessionsData, subjectsData] = await Promise.all([
                    api.getHistoricalSessions(),
                    api.getSubjects(),
                ]);
                setSessions(sessionsData);
                setSubjects(subjectsData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        const dataBySubject: { [key: string]: { name: string, minutes: number, color: string } } = {};

        subjects.forEach(subject => {
            dataBySubject[subject.id] = {
                name: subject.name,
                minutes: 0,
                color: subject.color.replace('bg-', '').replace('-500', '')
            };
        });

        sessions.forEach(session => {
            if (session.type === SessionType.Focus && session.durationMs && dataBySubject[session.subjectId]) {
                dataBySubject[session.subjectId].minutes += session.durationMs / (1000 * 60);
            }
        });
        
        return Object.values(dataBySubject).map(d => ({...d, minutes: Math.round(d.minutes)}));
    }, [sessions, subjects]);
    
     const subjectColorMap: {[key: string]: string} = {
        'red': '#ef4444',
        'blue': '#3b82f6',
        'green': '#22c55e',
        'yellow': '#eab308'
    };

    if (isLoading) {
        return <div className="text-center p-10 text-slate-300">Loading reports...</div>;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Reports</h2>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-6">
                <h3 className="text-xl font-bold text-slate-100 mb-6">Time Spent per Subject (Minutes)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5, right: 20, left: -10, bottom: 5,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6366f150" />
                            <XAxis dataKey="name" tick={{fill: '#cbd5e1', fontSize: 12}}/>
                            <YAxis tick={{fill: '#cbd5e1', fontSize: 12}}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #7c3aed50',
                                    borderRadius: '0.75rem',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Bar dataKey="minutes" name="Focused Minutes" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-6">
                <h3 className="text-xl font-bold text-slate-100 mb-4">About This Data</h3>
                <p className="text-slate-300 text-sm mb-4">
                    These reports show time spent on tasks during focus sessions. The data updates as Ashlynn completes tasks and logs study time.
                    Currently showing data from {sessions.length} session{sessions.length !== 1 ? 's' : ''}.
                </p>
                <div className="text-center">
                    <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50">
                        Export CSV (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
