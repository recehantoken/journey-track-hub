
import { toast } from '@/components/ui/sonner';

/**
 * Helper function to display toast messages consistently throughout the application
 */
export const showToast = (message: string, options?: { type?: "default" | "destructive" }) => {
  toast(message, {
    ...(options?.type === "destructive" ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } } : {})
  });
};

/**
 * Helper function to quickly generate success toast messages 
 */
export const showSuccessToast = (message: string) => {
  toast(message, { 
    style: { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" }
  });
};

/**
 * Helper function to quickly generate error toast messages
 */
export const showErrorToast = (message: string) => {
  toast(message, { 
    style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }
  });
};
