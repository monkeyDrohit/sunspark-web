'use client';

import { ActivityLog } from '@/lib/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivitySidebarProps {
  logs: ActivityLog[];
}

export function ActivitySidebar({ logs }: ActivitySidebarProps) {
  return (
    <Card className="h-full border-l rounded-none shadow-none md:rounded-xl md:border md:shadow-sm flex flex-col max-h-[800px]">
      <CardHeader className="border-b pb-4 sticky top-0 bg-card z-10">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <History className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              let parsedDetails: any = {};
              try {
                if (log.details) parsedDetails = JSON.parse(log.details);
              } catch (e) {}

              const fieldsChanged = parsedDetails.updatedFields || [];
              const actionLabel = log.action === 'UPDATED_USER' ? 'updated this user' : 
                                  log.action === 'UPDATED_VENDOR' ? 'updated this vendor' : log.action;

              return (
                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">
                          {log.user?.name || log.user?.email || 'Unknown User'}
                        </span>{' '}
                        <span className="text-muted-foreground">{actionLabel}</span>
                      </p>
                      {fieldsChanged.length > 0 && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-2">
                          <span className="font-medium">Changes:</span> {fieldsChanged.join(', ')}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
