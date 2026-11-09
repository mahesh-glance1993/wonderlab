// Lesson module — mounted at /lesson/*.
//   /lesson/diagnostic                                   optional starting check for the learner's class
//   /lesson/:unitId/:objectiveId?mode=learn|practice|test  lesson workspace for one objective
import { Navigate, Route, Routes } from 'react-router-dom';
import Workspace from './Workspace';
import Diagnostic from './Diagnostic';
import './lesson.css';

export default function LessonFeature() {
  return (
    <Routes>
      <Route path="diagnostic" element={<Diagnostic />} />
      <Route path=":unitId/:objectiveId?" element={<Workspace />} />
      <Route path="*" element={<Navigate to="/learn" replace />} />
    </Routes>
  );
}
