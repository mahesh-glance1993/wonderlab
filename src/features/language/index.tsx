// Language courses (Telugu + English). Mounted at /lang/*.
import { Route, Routes } from 'react-router-dom';
import './language.css';
import { CourseMap, LanguageHome, UnitPage } from './CourseMap';
import { ActivityPage } from './Activity';
import { PrintSheet, TracePage } from './Trace';
import { ReadAlongPage } from './ReadAlong';
import { NotFound } from './NotFound';

export default function LanguageFeature() {
  return (
    <Routes>
      <Route index element={<LanguageHome />} />
      <Route path=":course" element={<CourseMap />} />
      <Route path=":course/trace/:setId" element={<TracePage />} />
      <Route path=":course/print/:setId" element={<PrintSheet />} />
      <Route path=":course/read/:passageId" element={<ReadAlongPage />} />
      <Route path=":course/:unitId" element={<UnitPage />} />
      <Route path=":course/:unitId/:objectiveId" element={<ActivityPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
