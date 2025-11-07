import React, { useState, useEffect, useCallback } from 'react';
import { Task, Subject, DailyStats, DailyGoal, ActiveSession, SessionType, Mood, TaskStatus } from '../types';
import * as api from '../services/mockApi';
import TaskCard from '../components/TaskCard';
import Timer from '../components/Timer';
import ProgressRing from '../components/ProgressRing';
import CheckInModal from '../components/CheckInModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AddTaskModal from '../components/AddTaskModal';
import { Award, Sun, Plus } from 'lucide-react';

const StudentView: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [stats, setStats] = useState<DailyStats | null>(null);
    const [goal, setGoal] = useState<DailyGoal | null>(null);
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
    const [taskToSubmit, setTaskToSubmit] = useState<Task | null>(null);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
    const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, subjectsData, statsData, goalData, sessionData] = await Promise.all([
                api.getTodaysTasks(),
                api.getSubjects(),
                api.getDailyStats(),
                api.getDailyGoal(),
                api.getActiveSession()
            ]);
            setTasks(tasksData);
            setSubjects(subjectsData);
            setStats(statsData);
            setGoal(goalData);
            setActiveSession(sessionData);
        } catch (error) {
            console.error("Failed to fetch student data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        // FIX: Replaced NodeJS.Timeout with a browser-compatible type.
        let checkInInterval: ReturnType<typeof setInterval>;
        if (activeSession?.type === SessionType.Focus) {
            // Check-in prompt every 10 minutes.
            checkInInterval = setInterval(() => {
                setCheckInModalOpen(true);
            }, 10 * 60 * 1000);
        }
        return () => clearInterval(checkInInterval);
    }, [activeSession]);

    const handleStartTask = useCallback(async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const session = await api.startSession(SessionType.Focus, task.estimateMins, taskId);
        setActiveSession(session);
        // FIX: Used TaskStatus enum instead of string literal 'in_progress'.
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, status: TaskStatus.InProgress} : t));
    }, [tasks]);

    const handleStartSession = useCallback(async (type: SessionType, durationMins: number) => {
        const session = await api.startSession(type, durationMins);
        setActiveSession(session);
    }, []);
    
    const handleStopSession = useCallback(async () => {
        await api.stopSession();
        setActiveSession(null);
        // If it was a focus session for a task, we might want to update the task status
        // For simplicity, we let submitting evidence handle final status.
        fetchData(); // Refresh all data
    }, [fetchData]);

    const handleTimerEnd = useCallback(() => {
        // TODO: Send notification "Break is over!" or "Focus session complete!"
        alert(activeSession?.type === SessionType.Focus ? "Focus session complete! Time for a break." : "Break's over! Ready for another round?");
        handleStopSession();
    }, [activeSession, handleStopSession]);

    const handleCheckIn = async (mood: Mood) => {
        await api.addCheckIn(mood);
        // You could add a small toast notification here
        console.log(`Checked in as: ${mood}`);
    };

    const handleSubmitTask = useCallback((taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setTaskToSubmit(task);
        }
    }, [tasks]);

    const handleConfirmSubmit = async () => {
        if (!taskToSubmit) return;
        
        // In a real app, this would come from a file upload or link input
        const dummyEvidenceUrl = `https://picsum.photos/seed/${taskToSubmit.id}/200/150`;

        try {
            const updatedTask = await api.submitEvidence(taskToSubmit.id, dummyEvidenceUrl);
            setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (error) {
            console.error("Failed to submit task:", error);
        } finally {
            setTaskToSubmit(null);
        }
    };
    
    const handleToggleExpand = (taskId: string) => {
        setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
    };

    const handleChecklistItemToggle = async (taskId: string, checklistItemId: string, done: boolean) => {
        try {
            const updatedTask = await api.updateChecklistItem(taskId, checklistItemId, done);
            setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? updatedTask : t)));
        } catch (error) {
            console.error("Failed to update checklist item:", error);
        }
    };

    const handleBreakdownTask = async (taskId: string) => {
        setBreakingDownTaskId(taskId);
        try {
            const updatedTask = await api.breakdownTaskWithAI(taskId);
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
        } catch (error) {
            console.error("Failed to break down task:", error);
            alert("Sorry, the AI couldn't break down that task. Make sure your API key is configured and try again.");
        } finally {
            setBreakingDownTaskId(null);
        }
    };

    const handleAddTask = async (taskData: {
        subjectId: string;
        title: string;
        description: string;
        dueDate: string;
        estimateMins: number;
    }) => {
        try {
            const newTask = await api.addTask(taskData);
            setTasks(prevTasks => [newTask, ...prevTasks]);
        } catch (error) {
            console.error("Failed to add task:", error);
            alert("Sorry, couldn't add the task. Please try again.");
        }
    };

    const getSubjectById = (id: string) => subjects.find(s => s.id === id);

    if (isLoading) {
        return <div className="text-center p-10 text-slate-300">Loading Ashlynn's day...</div>;
    }

    const minutesProgress = goal && stats ? Math.min((stats.focusedMinutes / goal.minutes) * 100, 100) : 0;
    const tasksProgress = goal && stats ? Math.min((stats.tasksCompleted / goal.tasks) * 100, 100) : 0;

    return (
        <div className="space-y-8">
            <CheckInModal isOpen={isCheckInModalOpen} onClose={() => setCheckInModalOpen(false)} onCheckIn={handleCheckIn} />
            <ConfirmationModal
                isOpen={!!taskToSubmit}
                onClose={() => setTaskToSubmit(null)}
                onConfirm={handleConfirmSubmit}
                title="Submit Your Work?"
                message={
                    <>
                        Are you sure you want to mark <br />
                        <span className="font-bold">"{taskToSubmit?.title}"</span>
                        <br /> as complete and submit it for review?
                    </>
                }
                confirmButtonText="Yes, Submit"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Hello, Ashlynn!</h2>
                    <p className="text-slate-300">Here's your plan for today. Let's make it a great one.</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 flex items-center justify-center space-x-4">
                    <Award className="w-10 h-10 text-amber-500" />
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{stats?.streak || 0} Day Streak</div>
                        <p className="text-sm text-slate-300">Keep up the great work!</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     <Timer 
                        activeSessionType={activeSession?.type || null}
                        onStart={handleStartSession}
                        onStop={handleStopSession}
                        onTimerEnd={handleTimerEnd}
                    />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Daily Progress</h3>
                    <div className="flex space-x-6">
                        <ProgressRing progress={minutesProgress} label="Minutes" value={`${stats?.focusedMinutes || 0}/${goal?.minutes || '?'}`} />
                        <ProgressRing progress={tasksProgress} label="Tasks" value={`${stats?.tasksCompleted || 0}/${goal?.tasks || '?'}`} />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                        <Sun size={24} className="mr-3 text-yellow-500"/> Today's Plan
                    </h2>
                    <button
                        onClick={() => setAddTaskModalOpen(true)}
                        className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Task
                    </button>
                </div>
                <div className="space-y-4">
                    {tasks.length > 0 ? tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            subject={getSubjectById(task.subjectId)}
                            isExpanded={task.id === expandedTaskId}
                            onToggleExpand={handleToggleExpand}
                            onChecklistItemToggle={handleChecklistItemToggle}
                            onStartTask={handleStartTask}
                            onSubmitTask={handleSubmitTask}
                            onBreakdownTask={handleBreakdownTask}
                            isBreakingDown={task.id === breakingDownTaskId}
                        />
                    )) : (
                        <div className="text-center py-10 bg-slate-800/50 backdrop-blur-lg rounded-lg shadow-lg shadow-purple-500/10 border border-purple-500/20">
                            <p className="text-slate-300 mb-4">No tasks for today. Add your first task to get started!</p>
                            <button
                                onClick={() => setAddTaskModalOpen(true)}
                                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                            >
                                <Plus size={20} className="mr-2" />
                                Add Your First Task
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                subjects={subjects}
            />
        </div>
    );
};

export default StudentView;