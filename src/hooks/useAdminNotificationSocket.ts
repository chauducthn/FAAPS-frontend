import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AdvisorRequestEvent } from '../types/admin';

const TOPIC = '/topic/admin/notifications';

/**
 * Live admin notifications over STOMP/WebSocket. The browser sends the session cookie with the handshake,
 * so no token is handled here. The broker keeps no history, so after every (re)connect the lists are
 * reloaded from the API to pick up anything that arrived while the socket was down.
 */
export function useAdminNotificationSocket() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignments'] });
    };

    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      setConnected(true);
      refresh();
      client.subscribe(TOPIC, (message) => {
        let event: Partial<AdvisorRequestEvent> = {};
        try {
          event = JSON.parse(message.body);
        } catch {
          // An unreadable event still means "something changed": the refresh below covers it.
        }
        refresh();
        if (event.type === 'ADVISOR_REQUEST') {
          toast.info(`Student ${event.studentCode ?? ''} asked for an advisor`.replace('  ', ' '), {
            action: { label: 'Review', onClick: () => navigate('/admin/assignments?tab=unassigned&pending=1') },
          });
        }
      });
    };
    client.onWebSocketClose = () => setConnected(false);
    client.onStompError = () => setConnected(false);

    client.activate();
    return () => {
      setConnected(false);
      void client.deactivate();
    };
  }, [queryClient, navigate]);

  return connected;
}
