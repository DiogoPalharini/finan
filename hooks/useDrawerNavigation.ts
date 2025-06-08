import { useDrawer } from '../contexts/DrawerContext';

export const useDrawerNavigation = () => {
  const { openDrawer } = useDrawer();

  return {
    openDrawer,
  };
}; 