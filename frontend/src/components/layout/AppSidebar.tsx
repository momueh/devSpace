import { LayoutDashboard, ListTodo, Settings } from 'lucide-react';
import { Link, useRouter } from '@tanstack/react-router';
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

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'My DevSpace',
    icon: ListTodo,
    path: '/my-devspace',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent>
        <div className='flex h-14 items-center border-b px-6'>
          <Link to='/' className='flex items-center gap-2 font-semibold'>
            <span className='text-xl'>DevSpace</span>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.state.location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon className='h-4 w-4' />
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
