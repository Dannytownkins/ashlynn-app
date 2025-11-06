import React from 'react';
import { Task, Subject, TaskStatus } from '../types';
import { Book, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Paperclip } from 'lucide-react';
import SubjectPill from './SubjectPill';

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  onStartTask?: (taskId: string) => void;
  onViewEvidence?: (task: Task) => void;
  onSubmitTask?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, subject, onStartTask, onViewEvidence, onSubmitTask }) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-shadow hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          {subject && <SubjectPill subject={subject} />}
          {getStatusIndicator()}
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{task.title}</h3>
        <p className="text-slate-600 text-sm mt-1 mb-3">{task.description}</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center text-sm text-slate-500 mb-2 sm:mb-0">
          <Clock size={16} className="mr-2" />
          <span>{task.estimateMins} minutes</span>
        </div>
        <div className="flex items-center space-x-2">
          {task.evidenceUrl && onViewEvidence && (
             <button
               onClick={() => onViewEvidence(task)}
               className="flex items-center text-sm text-indigo-600 font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
             >
              <Paperclip size={16} className="mr-1" /> View Work
            </button>
          )}
          {onSubmitTask && [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Rework].includes(task.status) && (
            <button
              onClick={() => onSubmitTask(task.id)}
              className="flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-shadow shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Send size={16} className="mr-2" /> Submit
            </button>
          )}
          {onStartTask && (task.status === TaskStatus.Todo || task.status === TaskStatus.Rework) && (
            <button
              onClick={() => onStartTask(task.id)}
              className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Book size={16} className="mr-2" /> Start Task
            </button>
          )}
          {task.status === TaskStatus.InProgress && (
             <button
              disabled
              className="flex items-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
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
