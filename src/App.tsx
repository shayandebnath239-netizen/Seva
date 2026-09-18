/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { Explore } from './pages/Explore.tsx';
import { ServiceDetail } from './pages/ServiceDetail.tsx';
import { AskSeva } from './pages/AskSeva.tsx';
import { Saved } from './pages/Saved.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AuthProvider } from './lib/AuthContext.tsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="category/:id" element={<Explore />} />
          <Route path="service/:id" element={<ServiceDetail />} />
          <Route path="ask" element={<AskSeva />} />
          <Route path="saved" element={<Saved />} />
          <Route path="admin" element={<AdminDashboard />} />
          {/* Add more routes here later */}
          <Route path="*" element={<div className="p-8 text-center text-neutral-500">Page not found</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
