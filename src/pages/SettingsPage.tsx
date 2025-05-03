
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Settings, Calendar, MapPin, Building2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string;
  created_at: string | null;
  updated_at: string | null;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .order('category', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          description: "Failed to load settings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle setting value change
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    );
  };
  
  // Save settings
  const saveSettings = async (category: string) => {
    try {
      setIsSaving(true);
      
      const settingsToUpdate = settings.filter(setting => setting.category === category);
      
      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('settings')
          .update({ value: setting.value })
          .eq('key', setting.key);
        
        if (error) throw error;
      }
      
      toast({
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully.`
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Group settings by category
  const generalSettings = settings.filter(setting => setting.category === 'general');
  const calendarSettings = settings.filter(setting => setting.category === 'calendar');
  const trackingSettings = settings.filter(setting => setting.category === 'tracking');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure application settings</p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <MapPin className="h-4 w-4 mr-2" />
            GPS Tracking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Company information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Loading settings...</p>
              ) : (
                <>
                  {generalSettings.map(setting => (
                    <div key={setting.id} className="grid gap-2">
                      <Label htmlFor={setting.key}>
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                      <Input 
                        id={setting.key}
                        value={setting.value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.description || ''}
                      />
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                  ))}
                  <Button 
                    onClick={() => saveSettings('general')} 
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar Integration</CardTitle>
              <CardDescription>
                Configure Google Calendar settings for booking synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Loading settings...</p>
              ) : (
                <>
                  {calendarSettings.map(setting => (
                    <div key={setting.id} className="grid gap-2">
                      <Label htmlFor={setting.key}>
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                      <Input 
                        id={setting.key}
                        value={setting.value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.description || ''}
                      />
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">How to find your Google Calendar ID:</p>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      <li>Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Calendar</a></li>
                      <li>Click the three dots next to your calendar name</li>
                      <li>Select "Settings and sharing"</li>
                      <li>Scroll down to "Integrate calendar"</li>
                      <li>Copy the Calendar ID</li>
                    </ol>
                  </div>
                  <Button 
                    onClick={() => saveSettings('calendar')} 
                    disabled={isSaving}
                    className="mt-4"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Traccar GPS Tracking</CardTitle>
              <CardDescription>
                Configure Traccar settings for vehicle GPS tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Loading settings...</p>
              ) : (
                <>
                  {trackingSettings.map(setting => (
                    <div key={setting.id} className="grid gap-2">
                      <Label htmlFor={setting.key}>
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                      <Input 
                        id={setting.key}
                        value={setting.value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.description || ''}
                        type={setting.key.includes('password') ? 'password' : 'text'}
                      />
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">Traccar Setup Information:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Default URL for demo server: https://demo.traccar.org</li>
                      <li>Default username: demo</li>
                      <li>Default password: demo</li>
                      <li>For production, set up your own Traccar server</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => saveSettings('tracking')} 
                    disabled={isSaving}
                    className="mt-4"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
