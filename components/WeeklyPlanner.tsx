import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyTask {
  title: string;
  description: string;
  subjectId: string;
  estimateMins: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

interface WeeklyPlannerProps {
  subjects: Subject[];
  onSaveTasks: (tasks: { title: string; description: string; subjectId: string; estimateMins: number; dueDate: string }[]) => void;
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ subjects, onSaveTasks }) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    estimateMins: 25,
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get the start of the week (Sunday) for the current week offset
  const getWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (weekOffset * 7);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Get array of dates for the week
  const getWeekDates = () => {
    const weekStart = getWeekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const handleAddTask = (dayOfWeek: number) => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    setWeeklyTasks([
      ...weeklyTasks,
      {
        ...newTask,
        dayOfWeek,
      },
    ]);

    // Reset form
    setNewTask({
      title: '',
      description: '',
      subjectId: subjects[0]?.id || '',
      estimateMins: 25,
    });
    setEditingDay(null);
  };

  const handleRemoveTask = (index: number) => {
    setWeeklyTasks(weeklyTasks.filter((_, i) => i !== index));
  };

  const handleSaveWeek = () => {
    if (weeklyTasks.length === 0) {
      alert('Please add at least one task to the week');
      return;
    }

    // Convert weekly tasks to actual tasks with due dates
    const tasksWithDates = weeklyTasks.map(task => {
      const dueDate = new Date(weekDates[task.dayOfWeek]);
      dueDate.setHours(23, 59, 59);
      return {
        title: task.title,
        description: task.description,
        subjectId: task.subjectId,
        estimateMins: task.estimateMins,
        dueDate: dueDate.toISOString(),
      };
    });

    onSaveTasks(tasksWithDates);
    setWeeklyTasks([]);
    setWeekOffset(0);
  };

  const getTasksForDay = (dayOfWeek: number) => {
    return weeklyTasks.filter(task => task.dayOfWeek === dayOfWeek);
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-100 flex items-center">
          <Calendar size={28} className="mr-3 text-purple-400" />
          Weekly Task Planner
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-300 font-medium min-w-[120px] text-center">
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {daysOfWeek.map((day, dayIndex) => {
          const tasksForDay = getTasksForDay(dayIndex);
          const dateForDay = weekDates[dayIndex];
          const isToday = dateForDay.toDateString() === new Date().toDateString();

          return (
            <div
              key={dayIndex}
              className={`p-4 rounded-lg border transition-all ${
                isToday
                  ? 'bg-purple-900/30 border-purple-500/50'
                  : 'bg-slate-700/30 border-purple-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-100">{day}</h4>
                  <p className="text-xs text-slate-400">
                    {dateForDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setEditingDay(dayIndex)}
                  className="p-1.5 bg-purple-600/50 text-white rounded-lg hover:bg-purple-600 transition-all"
                  title="Add task"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks for this day */}
              <div className="space-y-2">
                {tasksForDay.map((task, taskIndex) => {
                  const globalIndex = weeklyTasks.findIndex(
                    t => t.dayOfWeek === dayIndex && t.title === task.title
                  );
                  const subject = getSubjectById(task.subjectId);

                  return (
                    <div
                      key={taskIndex}
                      className="p-2 bg-slate-800/50 rounded-lg border border-purple-500/20 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: `${subject.color}33`, color: subject.color }}
                              >
                                {subject.name}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">{task.estimateMins}m</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTask(globalIndex)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Form */}
      {editingDay !== null && (
        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-100">
              Add Task for {daysOfWeek[editingDay]}
            </h4>
            <button
              onClick={() => setEditingDay(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <input
              type="text"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <select
              value={newTask.subjectId}
              onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newTask.estimateMins}
              onChange={(e) => setNewTask({ ...newTask, estimateMins: parseInt(e.target.value) || 25 })}
              min="5"
              step="5"
              placeholder="Minutes"
              className="px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <button
            onClick={() => handleAddTask(editingDay)}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-purple-500/50"
          >
            Add Task
          </button>
        </div>
      )}

      {/* Summary and Save */}
      {weeklyTasks.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-purple-500/30">
          <div className="text-slate-300">
            <span className="font-semibold">{weeklyTasks.length}</span> tasks planned this week
          </div>
          <button
            onClick={handleSaveWeek}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg shadow-green-500/50"
          >
            Save Week
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
