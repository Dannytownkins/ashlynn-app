import React from 'react';
import { Task, Subject, TaskStatus } from '../types';
import { Book, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Paperclip, ChevronDown, Sparkles } from 'lucide-react';
import SubjectPill from './SubjectPill';

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
  onChecklistItemToggle?: (taskId: string, checklistItemId: string, done: boolean) => void;
  onStartTask?: (taskId: string) => void;
  onViewEvidence?: (task: Task) => void;
  onSubmitTask?: (taskId: string) => void;
  onBreakdownTask?: (taskId: string) => void;
  isBreakingDown?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, subject, isExpanded, onToggleExpand, onChecklistItemToggle, onStartTask, onViewEvidence, onSubmitTask, onBreakdownTask, isBreakingDown }) => {
  const getStatusIndicator = () => {
    switch (task.status) {
      case TaskStatus.Submitted:
        return <div className="flex items-center text-xs text-green-600"><CheckCircle2 size={14} className="mr-1" /> Submitted</div>;
      case TaskStatus.Rework:
        return <div className="flex items-center text-xs text-amber-600"><AlertCircle size={14} className="mr-1" /> Rework Requested</div>;
      case TaskStatus.InProgress:
        return <div className="flex items-center text-xs text-blue-600 animate-pulse"><RefreshCw size={14} className="mr-1 animate-spin" /> In Progress</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-500/10 border border-purple-500/20 p-4 transition-shadow hover:shadow-xl hover:shadow-purple-500/20 flex flex-col justify-between">
      <div>
        <div onClick={() => onToggleExpand(task.id)} className="cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            {subject && <SubjectPill subject={subject} />}
            <div className="flex items-center space-x-4">
              {getStatusIndicator()}
              <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <h3 className="font-bold text-slate-100 text-lg">{task.title}</h3>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0'}`}>
          <div className="pt-3 border-t border-purple-500/20">
            <p className="text-slate-300 text-sm mb-4">{task.description}</p>

            <h4 className="text-sm font-semibold text-slate-300 mb-2">Checklist</h4>
            {task.checklist.length > 0 ? (
              <ul className="space-y-2">
                {task.checklist.map(item => (
                  <li key={item.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${task.id}-${item.id}`}
                      checked={item.done}
                      onChange={(e) => onChecklistItemToggle?.(task.id, item.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      disabled={!onChecklistItemToggle}
                    />
                    <label htmlFor={`${task.id}-${item.id}`} className={`ml-3 text-sm cursor-pointer ${item.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {item.label}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No checklist items for this task.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 border-t border-purple-500/20 pt-3 gap-2">
        <div className="flex items-center text-sm text-slate-400 mb-2 sm:mb-0">
          <Clock size={16} className="mr-2" />
          <span>{task.estimateMins} minutes</span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {task.evidenceUrl && onViewEvidence && (
             <button
               onClick={() => onViewEvidence(task)}
               className="flex items-center text-sm text-purple-400 font-semibold py-2 px-3 rounded-lg hover:bg-purple-500/20 transition-colors whitespace-nowrap"
             >
              <Paperclip size={16} className="mr-1" /> View Work
            </button>
          )}
          {onBreakdownTask && task.checklist.length === 0 && task.description && (task.status === TaskStatus.Todo || task.status === TaskStatus.Rework) && (
            <button
              onClick={() => onBreakdownTask(task.id)}
              disabled={isBreakingDown}
              className="flex items-center text-sm text-purple-400 font-semibold py-2 px-3 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
            >
              {isBreakingDown ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
              {isBreakingDown ? 'Thinking...' : 'AI Breakdown'}
            </button>
          )}
          {onSubmitTask && [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Rework].includes(task.status) && (
            <button
              onClick={() => onSubmitTask(task.id)}
              className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
            >
              <Send size={16} className="mr-2" /> Submit
            </button>
          )}
          {onStartTask && (task.status === TaskStatus.Todo || task.status === TaskStatus.Rework) && (
            <button
              onClick={() => onStartTask(task.id)}
              className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 whitespace-nowrap"
            >
              <Book size={16} className="mr-2" /> Start Task
            </button>
          )}
          {task.status === TaskStatus.InProgress && (
             <button
              disabled
              className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed whitespace-nowrap"
             >
              <RefreshCw size={16} className="mr-2 animate-spin"/> Working
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;