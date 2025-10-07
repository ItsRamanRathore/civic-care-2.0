import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();

  const routeMap = {
    '/public-landing-page': { label: 'Home', icon: 'Home' },
    '/issue-reporting-form': { label: 'Report Issue', icon: 'Plus' },
    '/public-reports-listing': { label: 'Browse Issues', icon: 'Search' },
    '/interactive-issue-map': { label: 'Issue Map', icon: 'Map' },
    '/admin-dashboard': { label: 'Admin Dashboard', icon: 'BarChart3' },
    '/analytics-dashboard': { label: 'Analytics', icon: 'TrendingUp' }
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/public-landing-page', icon: 'Home' }];

    if (location?.pathname === '/public-landing-page') {
      return breadcrumbs;
    }

    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          icon: routeInfo?.icon,
          isLast: index === pathSegments?.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((item, index) => (
          <li key={item?.path || index} className="flex items-center">
            {index > 0 && (
              <Icon name="ChevronRight" size={14} className="mx-2 text-border" />
            )}
            {item?.isLast || !item?.path ? (
              <span className="flex items-center space-x-1 text-text-primary font-medium">
                {item?.icon && <Icon name={item?.icon} size={14} />}
                <span>{item?.label}</span>
              </span>
            ) : (
              <Link
                to={item?.path}
                className="flex items-center space-x-1 hover:text-primary transition-smooth"
              >
                {item?.icon && <Icon name={item?.icon} size={14} />}
                <span>{item?.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;