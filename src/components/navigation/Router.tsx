import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

function getPathFromLocation(): string {
  // Check hash first (e.g. #/dashboard or #dashboard)
  const hash = window.location.hash.replace(/^#\/?/, '/');
  if (hash && hash !== '/') {
    return hash.startsWith('/') ? hash : `/${hash}`;
  }
  // Otherwise check pathname
  const path = window.location.pathname;
  return path || '/';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(getPathFromLocation);

  useEffect(() => {
    const handleLocationChange = () => {
      const nextPath = getPathFromLocation();
      setCurrentPath(nextPath);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = `#${cleanPath}`;
    setCurrentPath(cleanPath);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Link: React.FC<{
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}> = ({ href, children, className = '', onClick, title }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(href);
  };

  return (
    <a href={`#${href.startsWith('/') ? href : '/' + href}`} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
};
