'use client';

import Image from 'next/image';
import { History, PlusCircle } from 'lucide-react';
import type { EnhancementResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from './icons';

interface HistorySidebarProps {
  history: EnhancementResult[];
  currentResultId: string | null;
  onSelectResult: (id: string | null) => void;
  onNewEnhancement: () => void;
  isLoading: boolean;
}

export function HistorySidebar({
  history,
  currentResultId,
  onSelectResult,
  onNewEnhancement,
  isLoading,
}: HistorySidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r bg-background/80 backdrop-blur-xl"
      >
        <SidebarHeader className="h-16 flex items-center justify-between">
          <div
            className={cn(
              'flex items-center gap-2',
              isCollapsed && 'justify-center'
            )}
          >
            <Logo className="h-8 w-8 text-primary" />
            <h1
              className={cn(
                'text-xl font-bold tracking-tight',
                isCollapsed && 'hidden'
              )}
            >
              ImageBoost AI
            </h1>
          </div>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onNewEnhancement}
                isActive={!currentResultId && !isLoading}
                tooltip={{ children: 'New Enhancement' }}
              >
                <PlusCircle />
                New Enhancement
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div
            className={cn(
              'mt-4 flex items-center gap-2 px-3 text-sm font-semibold text-muted-foreground',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <History className="h-5 w-5 shrink-0" />
            <span className={cn(isCollapsed && 'hidden')}>History</span>
          </div>
          <SidebarMenu>
            {isLoading && (
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            )}
            {history.length > 0 ? (
              history.map((item) => (
                <SidebarMenuItem key={item.filename}>
                  <SidebarMenuButton
                    onClick={() => onSelectResult(item.filename)}
                    isActive={currentResultId === item.filename}
                    className="h-14 justify-start gap-3"
                    tooltip={{
                      children: (
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.enhanced_image_base64}
                            alt={`Enhanced ${item.filename}`}
                            width={32}
                            height={32}
                            className="rounded-md object-cover"
                          />
                          <span>{item.filename}</span>
                        </div>
                      ),
                    }}
                  >
                    <Image
                      src={item.enhanced_image_base64}
                      alt={`Enhanced ${item.filename}`}
                      width={40}
                      height={40}
                      className="shrink-0 rounded-md object-cover"
                    />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="truncate font-medium">
                        {item.filename}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.improvement_analysis.percentage_improvement > 0 ? '+' : ''}
                        {item.improvement_analysis.percentage_improvement.toFixed(0)}%
                        Quality
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              !isLoading && (
                <div
                  className={cn(
                    'p-4 text-center text-sm text-muted-foreground',
                    isCollapsed && 'hidden'
                  )}
                >
                  Your enhanced images will appear here.
                </div>
              )
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
