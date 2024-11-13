export const useActiveLink = () => {
  const route = useRoute();

  const isActive = (linkPath: string) => {
    const routePath = route.path;

    return routePath === linkPath;
  };

  const isActiveOrParent = (linkPath: string) => {
    const routePath = route.path;

    return routePath.startsWith(linkPath);
  };

  return { isActive, isActiveOrParent };
};
