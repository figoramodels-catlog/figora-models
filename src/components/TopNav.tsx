import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid,
  LogOut,
  Moon,
  ShoppingBag,
  Sun,
  User as UserIcon } from
'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../utils/cn';

const iconButton =
'grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground transition-all duration-200 ease-ios hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const { totalQuantity, openCart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        
        <Link
          to="/"
          className="font-display text-[13px] font-semibold tracking-[0.2em] text-foreground transition-opacity duration-200 hover:opacity-70 sm:text-[15px]">
          
          FIGORA MODELS
        </Link>

        <Link
          to="/"
          className="ml-4 hidden text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:block">
          
          Collection
        </Link>

        {isAdmin &&
        <Link
          to="/admin"
          className="hidden text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:block">
          
            Admin
          </Link>
        }

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className={iconButton}>
            
            {theme === 'dark' ?
            <Sun className="h-4 w-4" aria-hidden="true" /> :

            <Moon className="h-4 w-4" aria-hidden="true" />
            }
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
              user ? setMenuOpen((value) => !value) : navigate('/login')
              }
              aria-label={user ? 'Account menu' : 'Sign in'}
              aria-expanded={user ? menuOpen : undefined}
              className={iconButton}>
              
              <UserIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {user && menuOpen &&
              <>
                  <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true" />
                
                  <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lift">
                  
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {user.fullName}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    {isAdmin &&
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-foreground transition-colors duration-200 hover:bg-accent">
                    
                        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                        Admin dashboard
                      </Link>
                  }
                    <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-foreground transition-colors duration-200 hover:bg-accent">
                    
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              }
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${totalQuantity} item${
            totalQuantity === 1 ? '' : 's'}`
            }
            className={cn(iconButton, 'relative')}>
            
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <AnimatePresence>
              {totalQuantity > 0 &&
              <motion.span
                key={totalQuantity}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                className="tabular absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                
                  {totalQuantity}
                </motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </nav>
    </header>);

}