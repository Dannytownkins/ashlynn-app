
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session, Subject, SessionType } from '../types';
import * as api from '../services/firestoreApi';

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
    
    const handleExportCSV = () => {
        // Create CSV content for sessions
        const csvRows = [
            ['Date', 'Type', 'Subject', 'Duration (minutes)', 'Check-ins'].join(','),
            ...sessions.map(session => {
                const date = new Date(session.startedAt).toLocaleDateString();
                const duration = session.durationMs ? Math.round(session.durationMs / (1000 * 60)) : 0;
                const subjectName = subjects.find(s => s.id === session.subjectId)?.name || '';
                const checkins = session.checkins?.length || 0;
                return [
                    date,
                    session.type,
                    subjectName,
                    duration.toString(),
                    checkins.toString()
                ].join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `focusflow-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <button 
                    onClick={handleExportCSV}
                    className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-shadow"
                >
                    Export CSV
                </button>
            </div>
        </div>
    );
};

export default ReportsView;
