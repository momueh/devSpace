import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LayoutDashboard, ListTodo, Settings } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  // {
  //   title: 'Projects',
  //   url: '/projects',
  //   icon: FolderKanban,
  // },
  {
    title: 'My DevSpace',
    url: '/my-devspace',
    icon: ListTodo,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className='bg-gradient-to-b from-blue-200 to-white-50'>
        <div className='flex h-14 items-center border-b border-gray-400  px-6'>
          <Link
            to='/dashboard'
            className='flex items-center gap-2 font-semibold'
          >
            <img src='/logo.svg' alt='DevSpace Logo' className='h-8 w-auto' />
            <span className='text-xl'>DevSpace</span>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
