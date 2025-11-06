
import React from 'react';
import { Subject } from '../types';

interface SubjectPillProps {
  subject: Subject;
}

const SubjectPill: React.FC<SubjectPillProps> = ({ subject }) => {
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${subject.color}`}>
      {subject.name}
    </span>
  );
};

export default SubjectPill;
