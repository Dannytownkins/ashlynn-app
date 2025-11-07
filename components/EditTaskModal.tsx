import React, { useState, useEffect } from 'react';
import { Task, Subject } from '../types';
import { Save, X } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, taskData: {
    subjectId: string;
    title: string;
    description: string;
    dueDate: string;
    estimateMins: number;
  }) => void;
  task: Task | null;
  subjects: Subject[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSave, task, subjects }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [estimateMins, setEstimateMins] = useState(25);
    const [dueDate, setDueDate] = useState('');

    // Initialize form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setSubjectId(task.subjectId);
            setEstimateMins(task.estimateMins);
            setDueDate(task.dueDate.split('T')[0]);
        }
    }, [task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !task) {
            alert('Please fill in all required fields');
            return;
        }

        onSave(task.id, {
            subjectId,
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate).toISOString(),
            estimateMins,
        });

        onClose();
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800/95 backdrop-blur-lg border-b border-purple-500/20 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Edit Task
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Task Title */}
                    <div>
                        <label htmlFor="edit-task-title" className="block text-sm font-semibold text-slate-300 mb-2">
                            Task Title *
                        </label>
                        <input
                            id="edit-task-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Math homework chapter 5"
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="edit-task-description" className="block text-sm font-semibold text-slate-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="edit-task-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what needs to be done..."
                            rows={4}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label htmlFor="edit-task-subject" className="block text-sm font-semibold text-slate-300 mb-2">
                            Subject
                        </label>
                        <select
                            id="edit-task-subject"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer"
                        >
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date and Time Estimate Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Due Date */}
                        <div>
                            <label htmlFor="edit-task-due-date" className="block text-sm font-semibold text-slate-300 mb-2">
                                Due Date
                            </label>
                            <input
                                id="edit-task-due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                required
                            />
                        </div>

                        {/* Time Estimate */}
                        <div>
                            <label htmlFor="edit-task-estimate" className="block text-sm font-semibold text-slate-300 mb-2">
                                Time (minutes)
                            </label>
                            <input
                                id="edit-task-estimate"
                                type="number"
                                min="5"
                                max="480"
                                step="5"
                                value={estimateMins}
                                onChange={(e) => setEstimateMins(parseInt(e.target.value) || 25)}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all border border-slate-600/50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 flex items-center justify-center"
                        >
                            <Save size={20} className="mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;
