
import { toast } from '@/components/ui/sonner';

/**
 * Helper function to display toast messages consistently throughout the application
 */
export const showToast = (message: string, options?: { variant?: 'default' | 'destructive' }) => {
  toast(message, options);
};

/**
 * Helper function to quickly generate success toast messages 
 */
export const showSuccessToast = (message: string) => {
  toast(message, { 
    description: message 
  });
};

/**
 * Helper function to quickly generate error toast messages
 */
export const showErrorToast = (message: string) => {
  toast(message, { 
    variant: "destructive",
    description: message 
  });
};
