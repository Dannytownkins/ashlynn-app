import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/mockApi';
import { Task, Subject, Session, TaskStatus } from '../types';
import { Activity, CheckCircle, Smartphone, Clock, MessageSquare, AlertTriangle, PlusCircle } from 'lucide-react';
import SubjectPill from '../components/SubjectPill';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

type LiveStatus = {
  studentState: string;
  lastActivity: string;
  activeTask: string | null;
};

const ParentView: React.FC = () => {
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
    const [submittedTasks, setSubmittedTasks] = useState<Task[]>([]);
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [status, tasks, sessions, subs] = await Promise.all([
                api.getLiveStatus(),
                api.getSubmittedTasks(),
                api.getHistoricalSessions(),
                api.getSubjects(),
            ]);
            setLiveStatus(status);
            setSubmittedTasks(tasks);
            setRecentSessions(sessions.slice(-5).reverse());
            setSubjects(subs);
        } catch (error) {
            console.error("Failed to fetch parent data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for live status updates
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleEnforceDowntime = async () => {
        alert("This will call a webhook to enforce phone downtime.");
        await api.callEnforceWebhook();
    };
    
    const handleApproveTask = async (taskId: string) => {
        await api.markTaskDone(taskId);
        fetchData(); // Refresh data
    }
    
    const handleReworkTask = async (taskId: string) => {
        const note = prompt("Please provide a short note for the rework request:");
        if (note) {
            await api.requestRework(taskId, note);
            fetchData(); // Refresh data
        }
    }
    
    const handleAddTask = async (taskData: Omit<Task, 'id' | 'status' | 'checklist' | 'evidenceUrl'>) => {
        try {
            await api.addTask(taskData);
            setAddTaskModalOpen(false);
            // In a real app, you might want a more sophisticated success message (toast)
            alert("Task added successfully!");
            // We don't need to call fetchData() here, as the new task won't immediately
            // appear in "Needs Review" or "Recent Activity". It will appear for the student.
        } catch (error) {
            console.error("Failed to add task:", error);
            alert("Could not add the task. Please try again.");
        }
    };

    const getSubjectById = (id: string) => subjects.find(s => s.id === id);

    if (isLoading && !liveStatus) {
        return <div className="text-center p-10">Loading Dan's dashboard...</div>;
    }
    
    const StatusIndicator = () => {
        if (!liveStatus) return null;
        const isIdle = liveStatus.studentState === 'Idle';
        const isFocusing = liveStatus.studentState === 'Focusing';

        return (
            <div className={`p-6 rounded-xl shadow-sm border ${isIdle ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${isIdle ? 'bg-amber-500' : 'bg-green-500'} ${isFocusing ? 'animate-pulse' : ''}`}></div>
                    <h3 className="text-xl font-bold">{liveStatus.studentState}</h3>
                </div>
                {liveStatus.activeTask && <p className="mt-2 text-slate-600">Working on: <span className="font-semibold">{liveStatus.activeTask}</span></p>}
                <p className="text-sm text-slate-500 mt-1">Last activity at {liveStatus.lastActivity}</p>
            </div>
        )
    };

    return (
        <div className="space-y-8">
             <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
            />
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Parent Dashboard</h2>
                <button
                    onClick={() => setAddTaskModalOpen(true)}
                    className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusCircle size={18} className="mr-2"/>
                    Add Task
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatusIndicator />
                </div>
                <div className="bg-red-50 border-red-200 border p-4 rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-2"/>
                    <p className="text-red-800 font-semibold mb-2">No start yet?</p>
                    <button onClick={handleEnforceDowntime} className="flex items-center bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-shadow shadow-sm hover:shadow-md">
                        <Smartphone size={16} className="mr-2" /> Enforce Downtime
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><CheckCircle size={24} className="mr-3 text-green-500"/> Needs Review</h3>
                 <div className="space-y-4">
                    {submittedTasks.length > 0 ? submittedTasks.map(task => (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                            <div className="flex items-center text-sm my-2">
                               {getSubjectById(task.subjectId) && <SubjectPill subject={getSubjectById(task.subjectId)!} />}
                               <span className={`ml-3 font-semibold ${task.status === TaskStatus.Rework ? 'text-amber-600' : 'text-green-600'}`}>{task.status === TaskStatus.Rework ? 'Rework Requested' : 'Submitted'}</span>
                            </div>
                            {task.evidenceUrl && <img src={task.evidenceUrl} alt="Evidence" className="my-2 rounded-lg max-h-40"/>}
                             <div className="flex items-center space-x-2 mt-3 border-t border-slate-100 pt-3">
                                 <button onClick={() => handleApproveTask(task.id)} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-shadow">Approve</button>
                                 <button onClick={() => handleReworkTask(task.id)} className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-shadow">Request Rework</button>
                             </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                            <p className="text-slate-500">Nothing to review right now.</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Activity size={24} className="mr-3 text-indigo-500"/> Recent Activity</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <ul className="space-y-3">
                        {recentSessions.map(session => (
                            <li key={session.id} className="flex items-center text-sm">
                                <Clock size={16} className="mr-3 text-slate-400"/>
                                <div>
                                    <span className="font-semibold">{session.type === 'focus' ? 'Focus' : 'Break'} Session</span>
                                    <span className="text-slate-500 mx-2">&middot;</span>
                                    {getSubjectById(session.subjectId)?.name}
                                    <span className="text-slate-500 mx-2">&middot;</span>
                                    {session.durationMs ? `${Math.round(session.durationMs / 60000)} mins` : ''}
                                </div>
                                <span className="ml-auto text-xs text-slate-400">{new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ParentView;