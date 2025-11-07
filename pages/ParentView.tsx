import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/mockApi';
import { Task, Subject, Session, TaskStatus } from '../types';
import { Activity, CheckCircle, Smartphone, Clock, MessageSquare, AlertTriangle, PlusCircle, Link, Edit, Trash2, Calendar } from 'lucide-react';
import SubjectPill from '../components/SubjectPill';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import WeeklyPlanner from '../components/WeeklyPlanner';

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
    const [isEditTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [showWeeklyPlanner, setShowWeeklyPlanner] = useState(false);

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
    
    const handleAddTask = async (taskData: {
        subjectId: string;
        title: string;
        description: string;
        dueDate: string;
        estimateMins: number;
    }) => {
        try {
            await api.addTask(taskData);
            setAddTaskModalOpen(false);
            alert("Task added successfully!");
            // We don't need to call fetchData() here, as the new task won't immediately
            // appear in "Needs Review" or "Recent Activity". It will appear for the student.
        } catch (error) {
            console.error("Failed to add task:", error);
            alert("Could not add the task. Please try again.");
        }
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setEditTaskModalOpen(true);
    };

    const handleSaveTask = async (taskId: string, taskData: {
        subjectId: string;
        title: string;
        description: string;
        dueDate: string;
        estimateMins: number;
    }) => {
        try {
            await api.updateTask(taskId, taskData);
            setEditTaskModalOpen(false);
            setTaskToEdit(null);
            fetchData(); // Refresh data to show updated task
            alert("Task updated successfully!");
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Could not update the task. Please try again.");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }
        try {
            await api.deleteTask(taskId);
            fetchData(); // Refresh data
            alert("Task deleted successfully!");
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Could not delete the task. Please try again.");
        }
    };

    const handleSaveWeeklyTasks = async (tasks: { title: string; description: string; subjectId: string; estimateMins: number; dueDate: string }[]) => {
        try {
            // Create all tasks
            await Promise.all(tasks.map(task => api.addTask(task)));
            alert(`Successfully added ${tasks.length} tasks for the week!`);
            setShowWeeklyPlanner(false);
        } catch (error) {
            console.error("Failed to add weekly tasks:", error);
            alert("Could not add all tasks. Please try again.");
        }
    };

    const getSubjectById = (id: string) => subjects.find(s => s.id === id);

    const isImageUrl = (url: string): boolean => {
        if (url.includes('picsum.photos')) {
            return true;
        }
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        try {
            const path = new URL(url).pathname.toLowerCase();
            return imageExtensions.some(ext => path.endsWith(ext));
        } catch (e) {
            return false;
        }
    };

    if (isLoading && !liveStatus) {
        return <div className="text-center p-10 text-slate-300">Loading Dan's dashboard...</div>;
    }
    
    const StatusIndicator = () => {
        if (!liveStatus) return null;
        const isIdle = liveStatus.studentState === 'Idle';
        const isFocusing = liveStatus.studentState === 'Focusing';

        return (
            <div className={`p-6 rounded-xl shadow-lg border backdrop-blur-lg ${isIdle ? 'bg-amber-900/30 border-amber-500/30 shadow-amber-500/10' : 'bg-green-900/30 border-green-500/30 shadow-green-500/10'}`}>
                <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${isIdle ? 'bg-amber-500' : 'bg-green-500'} ${isFocusing ? 'animate-pulse' : ''}`}></div>
                    <h3 className="text-xl font-bold text-slate-100">{liveStatus.studentState}</h3>
                </div>
                {liveStatus.activeTask && <p className="mt-2 text-slate-300">Working on: <span className="font-semibold text-slate-100">{liveStatus.activeTask}</span></p>}
                <p className="text-sm text-slate-400 mt-1">Last activity at {liveStatus.lastActivity}</p>
            </div>
        )
    };

    return (
        <div className="space-y-8">
             <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                subjects={subjects}
            />
            <EditTaskModal
                isOpen={isEditTaskModalOpen}
                onClose={() => {
                    setEditTaskModalOpen(false);
                    setTaskToEdit(null);
                }}
                onSave={handleSaveTask}
                task={taskToEdit}
                subjects={subjects}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-3xl font-bold text-slate-100">Parent Dashboard</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowWeeklyPlanner(!showWeeklyPlanner)}
                        className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70"
                    >
                        <Calendar size={18} className="mr-2"/>
                        {showWeeklyPlanner ? 'Hide' : 'Plan'} Week
                    </button>
                    <button
                        onClick={() => setAddTaskModalOpen(true)}
                        className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                    >
                        <PlusCircle size={18} className="mr-2"/>
                        Add Task
                    </button>
                </div>
            </div>

            {showWeeklyPlanner && (
                <WeeklyPlanner
                    subjects={subjects}
                    onSaveTasks={handleSaveWeeklyTasks}
                />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatusIndicator />
                </div>
                <div className="bg-red-900/30 border-red-500/30 border backdrop-blur-lg p-4 rounded-xl shadow-lg shadow-red-500/10 flex flex-col justify-center items-center text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-2"/>
                    <p className="text-red-200 font-semibold mb-2">No start yet?</p>
                    <button onClick={handleEnforceDowntime} className="flex items-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70">
                        <Smartphone size={16} className="mr-2" /> Enforce Downtime
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-100 mb-4 flex items-center"><CheckCircle size={24} className="mr-3 text-green-400"/> Needs Review</h3>
                 <div className="space-y-4">
                    {submittedTasks.length > 0 ? submittedTasks.map(task => (
                        <div key={task.id} className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-4">
                            <h4 className="font-bold text-slate-100 text-lg">{task.title}</h4>
                            <div className="flex items-center text-sm my-2">
                               {getSubjectById(task.subjectId) && <SubjectPill subject={getSubjectById(task.subjectId)!} />}
                               <span className={`ml-3 font-semibold ${task.status === TaskStatus.Rework ? 'text-amber-400' : 'text-green-400'}`}>{task.status === TaskStatus.Rework ? 'Rework Requested' : 'Submitted'}</span>
                            </div>

                            {task.evidenceUrl && (
                                <div className="my-3 p-3 bg-slate-700/50 rounded-lg border border-purple-500/20">
                                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Submitted Evidence</h5>
                                    {isImageUrl(task.evidenceUrl) ? (
                                        <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={task.evidenceUrl}
                                                alt={`Evidence for ${task.title}`}
                                                className="rounded-lg max-h-48 w-auto border border-purple-500/30 hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            href={task.evidenceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-purple-400 hover:text-purple-300 hover:underline font-medium"
                                        >
                                            <Link size={16} className="mr-2 flex-shrink-0" />
                                            <span className="truncate">{task.evidenceUrl}</span>
                                        </a>
                                    )}
                                </div>
                            )}

                             <div className="flex flex-wrap items-center gap-2 mt-3 border-t border-purple-500/20 pt-3">
                                 <button onClick={() => handleApproveTask(task.id)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70">Approve</button>
                                 <button onClick={() => handleReworkTask(task.id)} className="bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70">Request Rework</button>
                                 <button onClick={() => handleEditTask(task)} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 flex items-center">
                                     <Edit size={16} className="mr-2" />
                                     Edit
                                 </button>
                                 <button onClick={() => handleDeleteTask(task.id)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 flex items-center">
                                     <Trash2 size={16} className="mr-2" />
                                     Delete
                                 </button>
                             </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-slate-800/50 backdrop-blur-lg rounded-lg shadow-lg shadow-purple-500/10 border border-purple-500/20">
                            <p className="text-slate-300">Nothing to review right now.</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-100 mb-4 flex items-center"><Activity size={24} className="mr-3 text-indigo-400"/> Recent Activity</h3>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-4">
                    <ul className="space-y-3">
                        {recentSessions.length > 0 ? recentSessions.map(session => (
                            <li key={session.id} className="flex items-center text-sm">
                                <Clock size={16} className="mr-3 text-slate-400"/>
                                <div className="text-slate-300">
                                    <span className="font-semibold text-slate-100">{session.type === 'focus' ? 'Focus' : 'Break'} Session</span>
                                    <span className="text-slate-500 mx-2">&middot;</span>
                                    {getSubjectById(session.subjectId)?.name}
                                    <span className="text-slate-500 mx-2">&middot;</span>
                                    {session.durationMs ? `${Math.round(session.durationMs / 60000)} mins` : ''}
                                </div>
                                <span className="ml-auto text-xs text-slate-400">{new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </li>
                        )) : (
                            <li className="text-center text-slate-400 py-4">No recent activity</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ParentView;