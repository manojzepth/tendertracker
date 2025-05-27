import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, LogOut, ChevronRight, LayoutDashboard, FileText, Users, BarChart3, ClipboardList, PieChart } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const pathParts = location.pathname.split('/');
  const projectId = pathParts[2];
  const tenderId = pathParts[4];
  
  const navigation = [
    { name: 'Projects', href: '/projects', icon: LayoutDashboard, current: location.pathname === '/projects', color: 'primary' },
    { name: 'Tenders', href: projectId ? `/projects/${projectId}/tenders` : '', icon: FileText, current: location.pathname.includes('/tenders') && !location.pathname.includes('/bidders') && !location.pathname.includes('/evaluation') && !location.pathname.includes('/reports') && !location.pathname.includes('/comparison'), disabled: !projectId, color: 'secondary' },
    { name: 'Documents', href: tenderId ? `/projects/${projectId}/tenders/${tenderId}/documents` : '', icon: FileText, current: location.pathname.includes('/documents'), disabled: !tenderId, color: 'info' },
    { name: 'Bidders', href: tenderId ? `/projects/${projectId}/tenders/${tenderId}/bidders` : '', icon: Users, current: location.pathname.includes('/bidders'), disabled: !tenderId, color: 'accent' },
    { name: 'Evaluation', href: tenderId ? `/projects/${projectId}/tenders/${tenderId}/evaluation` : '', icon: BarChart3, current: location.pathname.includes('/evaluation'), disabled: !tenderId, color: 'info' },
    { name: 'Reports', href: tenderId ? `/projects/${projectId}/tenders/${tenderId}/reports` : '', icon: ClipboardList, current: location.pathname.includes('/reports'), disabled: !tenderId, color: 'primary' },
    { name: 'Comparison', href: tenderId ? `/projects/${projectId}/tenders/${tenderId}/comparison` : '', icon: PieChart, current: location.pathname.includes('/comparison'), disabled: !tenderId, color: 'secondary' },
  ];
  
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ name: 'Projects', href: '/projects' }];
    
    if (projectId) {
      breadcrumbs.push({
        name: projectId === '1' ? 'Project Alpha' : `Project ${projectId}`,
        href: `/projects/${projectId}/tenders`,
      });
    }
    
    if (tenderId) {
      breadcrumbs.push({
        name: tenderId === '1' ? 'Tender 001' : `Tender ${tenderId}`,
        href: `/projects/${projectId}/tenders/${tenderId}/bidders`,
      });
      
      if (location.pathname.includes('/bidders')) {
        breadcrumbs.push({ name: 'Bidder Management', href: '#' });
      } else if (location.pathname.includes('/evaluation')) {
        breadcrumbs.push({ name: 'Document Evaluation', href: '#' });
      } else if (location.pathname.includes('/reports')) {
        breadcrumbs.push({ name: 'Contractor Reports', href: '#' });
      } else if (location.pathname.includes('/comparison')) {
        breadcrumbs.push({ name: 'Final Comparison', href: '#' });
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <div className="min-h-full">
      {/* Sidebar for mobile */}
      <div className={clsx("fixed inset-0 z-40 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full flex-col bg-gradient-to-b from-primary-600 to-primary-800 shadow-xl">
          <div className="flex items-center justify-between px-4 py-5 border-b border-primary-500/20">
            <div className="flex items-center">
              <Building2 size={24} className="text-white mr-2" />
              <h1 className="text-lg font-bold text-white">Tender Tracker</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-md p-2 text-white/80 hover:text-white hover:bg-primary-500/20">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.disabled ? '#' : item.href}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                    } else {
                      navigate(item.href);
                    }
                  }}
                  className={clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
                    item.current ? `bg-${item.color}-500/20 text-white` : 'text-white/80 hover:bg-white/10 hover:text-white',
                    item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="border-t border-primary-500/20 p-4 space-y-3">
            <div className="flex items-center bg-white/10 p-3 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-white/70">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut size={16} />}
              className="w-full text-white/80 hover:text-white hover:bg-white/10 border-0"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-primary-600 to-primary-800">
        <div className="flex items-center justify-between px-4 py-5 border-b border-primary-500/20">
          <div className="flex items-center">
            <Building2 size={24} className="text-white mr-2" />
            <h1 className="text-lg font-bold text-white">Tender Tracker</h1>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.disabled ? '#' : item.href}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    navigate(item.href);
                  }
                }}
                className={clsx(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
                  item.current ? `bg-${item.color}-500/20 text-white` : 'text-white/80 hover:bg-white/10 hover:text-white',
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="border-t border-primary-500/20 p-4 space-y-3">
          <div className="flex items-center bg-white/10 p-3 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-white/70">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
            className="w-full text-white/80 hover:text-white hover:bg-white/10 border-0"
          >
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          
          {/* Breadcrumbs */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.name} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight size={16} className="text-gray-400 mx-1" />
                  )}
                  <a
                    href={breadcrumb.href}
                    onClick={(e) => {
                      if (breadcrumb.href !== '#') {
                        e.preventDefault();
                        navigate(breadcrumb.href);
                      }
                    }}
                    className={clsx(
                      "text-sm font-medium",
                      index === breadcrumbs.length - 1
                        ? "text-primary-700"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {breadcrumb.name}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          
          {/* User menu with logout */}
          <div className="flex items-center space-x-3">
            {/* <span className="text-sm text-gray-700 hidden sm:block">
              {user?.name || 'User'}
            </span> */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut size={16} />}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
