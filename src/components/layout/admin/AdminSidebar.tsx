import { Link, useLocation } from 'react-router';

interface NavItem {
  name: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ name: 'Dashboard', path: '/admin/dashboard' }],
  },
  {
    title: 'USERS & ADVISORS',
    items: [
      { name: 'User Accounts', path: '/admin/users' },
      { name: 'Student Groups', path: '/admin/student-groups' },
      { name: 'Advisor Assignments', path: '/admin/assignments' },
    ],
  },
  {
    title: 'ACADEMIC DATA',
    items: [
      { name: 'Curriculum', path: '/admin/curriculum' },
      { name: 'Courses', path: '/admin/courses' },
    ],
  },
  {
    title: 'ACADEMIC RULES',
    items: [{ name: 'Academic Rules', path: '/admin/rules' }],
  },
  {
    title: 'ACADEMIC STRUCTURE',
    items: [
      { name: 'Majors', path: '/admin/majors' },
      { name: 'Cohorts', path: '/admin/cohorts' },
    ],
  },
  {
    title: 'AI',
    items: [
      { name: 'AI Configuration', path: '/admin/ai-config' },
      { name: 'AI Performance', path: '/admin/ai-performance' },
      { name: 'Reported AI Responses', path: '/admin/ai-reports', badge: 6 },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 select-none">
      {/* Logo Header */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
        <div className="w-7 h-7 rounded bg-[#F26F21] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
          F
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-gray-900 tracking-tight leading-none">FAAPS</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ADMIN CONSOLE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 text-xs">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <p className="text-[10px] font-bold text-gray-400 tracking-wider px-3 mb-2 uppercase">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-orange-50/80 text-[#F26F21] font-semibold border-l-2 border-[#F26F21]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-full">
                        · {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}