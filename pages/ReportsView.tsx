
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session, Subject, SessionType } from '../types';
import * as api from '../services/api';

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
        return <div className="text-center p-10">Loading reports...</div>;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">Reports</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Time Spent per Subject (Minutes)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5, right: 20, left: -10, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 12}}/>
                            <YAxis tick={{fill: '#475569', fontSize: 12}}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.75rem',
                                }}
                            />
                            <Bar dataKey="minutes" name="Focused Minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="text-center">
                 <button className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-shadow">
                    Export CSV (TODO)
                 </button>
            </div>
        </div>
    );
};

export default ReportsView;
