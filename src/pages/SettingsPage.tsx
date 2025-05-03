
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Calendar, Settings, Globe, Building, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Setting } from '@/types';

const SettingsPage = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        console.log('Settings loaded:', data);
        // Convert array of settings to an object for easier access
        const settingsObject: Record<string, string> = {};
        data.forEach((setting: Setting) => {
          settingsObject[setting.key] = setting.value || '';
        });
        
        setSettings(settingsObject);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (category: string) => {
    try {
      setSaving(true);
      
      // Get all settings for this category
      const { data: categorySettings, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('category', category);
        
      if (fetchError) throw fetchError;
      
      if (categorySettings) {
        // Update each setting in the category
        for (const setting of categorySettings) {
          const value = settings[setting.key] || null;
          
          const { error } = await supabase
            .from('settings')
            .update({ value })
            .eq('id', setting.id);
            
          if (error) throw error;
        }
      }
      
      toast("Settings updated successfully");
    } catch (error) {
      console.error(`Error updating ${category} settings:`, error);
      toast("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="calendar">Google Calendar</TabsTrigger>
            <TabsTrigger value="tracking">Traccar GPS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={settings.company_name || ''}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={settings.support_email || ''}
                      onChange={(e) => handleInputChange('support_email', e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="support_phone">Support Phone</Label>
                    <Input
                      id="support_phone"
                      value={settings.support_phone || ''}
                      onChange={(e) => handleInputChange('support_phone', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => updateSettings('general')}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save General Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Google Calendar Integration</span>
                </CardTitle>
                <CardDescription>
                  Configure Google Calendar API settings to sync your rental bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="google_calendar_id">Google Calendar ID</Label>
                    <Input
                      id="google_calendar_id"
                      value={settings.google_calendar_id || ''}
                      onChange={(e) => handleInputChange('google_calendar_id', e.target.value)}
                      placeholder="primary or calendar ID from Google"
                    />
                    <p className="text-sm text-muted-foreground">
                      Find your Calendar ID in Google Calendar settings. Use "primary" for your main calendar.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    Note: You need to set up a Google Service Account and add the required secrets to Supabase Functions for this integration to work properly.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => updateSettings('calendar')}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Calendar Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>Traccar GPS Tracking</span>
                </CardTitle>
                <CardDescription>
                  Configure Traccar API settings for GPS tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="traccar_url">Traccar Server URL</Label>
                    <Input
                      id="traccar_url"
                      value={settings.traccar_url || ''}
                      onChange={(e) => handleInputChange('traccar_url', e.target.value)}
                      placeholder="https://demo.traccar.org"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="traccar_user">Traccar Username</Label>
                    <Input
                      id="traccar_user"
                      value={settings.traccar_user || ''}
                      onChange={(e) => handleInputChange('traccar_user', e.target.value)}
                      placeholder="admin"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    Note: You need to configure Traccar password in Supabase Function secrets for the tracking integration to work properly.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => updateSettings('tracking')}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Tracking Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SettingsPage;
