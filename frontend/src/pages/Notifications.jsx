import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import { notificationService } from "../services/notificationService";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data?.notifications || res.notifications || [];
      setNotifications(list);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification.");
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="text-primary" /> Notifications
        </h1>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:underline flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" /> Mark all as read
          </button>
        )}
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5 text-destructive p-4 text-center mb-6">
          {error}
        </Card>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No notifications found.
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.is_read;
            
            return (
              <Card 
                key={notif.id} 
                className={`transition-all duration-200 relative group overflow-hidden ${
                  isUnread ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'hover:bg-slate-50'
                }`}
                onClick={() => isUnread && handleMarkAsRead(notif.id)}
              >
                <CardContent className="p-4 flex items-start gap-4 pr-12">
                  <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                    isUnread ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800">{notif.title || "Notification"}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-xs text-muted-foreground block mt-2">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  {isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2.5 flex-shrink-0"></div>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Delete Notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
