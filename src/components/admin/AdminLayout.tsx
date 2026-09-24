import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, LayoutGrid, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const navItems = [
{ to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
{ to: '/admin/products', label: 'Products', icon: Boxes, end: false }];


export function AdminLayout() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: {isActive: boolean;}) =>
  cn(
    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-ios',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive ?
    'bg-primary text-primary-foreground' :
    'text-muted-foreground hover:bg-accent hover:text-foreground'
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 sm:flex">
        <Link
          to="/"
          className="font-display text-[12px] font-semibold tracking-[0.18em] transition-opacity duration-200 hover:opacity-70">
          
          FIGORA MODELS
        </Link>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Admin
        </p>

        <nav aria-label="Admin" className="mt-6 space-y-1">
          {navItems.map((item) =>
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          )}
        </nav>

        <div className="mt-auto space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            
            {theme === 'dark' ?
            <Sun className="h-4 w-4" aria-hidden="true" /> :

            <Moon className="h-4 w-4" aria-hidden="true" />
            }
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
          {user &&
          <p className="truncate px-3 pt-2 text-[11px] text-muted-foreground">
              {user.email}
            </p>
          }
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-40 flex items-center gap-2 border-b border-border px-4 py-3 sm:hidden">
          <Link
            to="/"
            className="font-display text-[12px] font-semibold tracking-[0.18em]">
            
            FIGORA
          </Link>
          <nav aria-label="Admin" className="ml-auto flex items-center gap-1">
            {navItems.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
              cn(
                'grid h-9 w-9 place-items-center rounded-full border transition-colors duration-200',
                isActive ?
                'border-transparent bg-primary text-primary-foreground' :
                'border-border bg-surface text-muted-foreground'
              )
              }
              aria-label={item.label}>
              
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </NavLink>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
              
              {theme === 'dark' ?
              <Sun className="h-4 w-4" aria-hidden="true" /> :

              <Moon className="h-4 w-4" aria-hidden="true" />
              }
            </button>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/');
              }}
              aria-label="Logout"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
              
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          
          <Outlet />
        </motion.main>
      </div>
    </div>);

}