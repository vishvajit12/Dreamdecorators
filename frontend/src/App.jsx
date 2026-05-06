import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import SplashPage       from './pages/SplashPage'
import FactoryPage      from './pages/FactoryPage'
import ProjectListPage  from './pages/ProjectListPage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectEditPage  from './pages/ProjectEditPage'
import ItemEditPage     from './pages/ItemEditPage'
import NotFoundPage     from './pages/NotFoundPage'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                       element={<SplashPage />} />
        <Route path="/factory"                element={<FactoryPage />} />
        <Route path="/projects"               element={<ProjectListPage />} />
        <Route path="/projects/new"           element={<ProjectCreatePage />} />
        <Route path="/projects/:id"           element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit"      element={<ProjectEditPage />} />
        <Route path="/items/:id/edit"         element={<ItemEditPage />} />
        <Route path="*"                       element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}
