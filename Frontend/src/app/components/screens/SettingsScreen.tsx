import { ArrowLeft, ChevronRight, User, Bell, Shield, Palette, Lock, Info, LogOut } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [safetyAlertsEnabled, setSafetyAlertsEnabled]   = useState(true);

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <User    className="w-5 h-5" />,                       label: 'Profile',       action: 'navigate' as const },
        { icon: <LogOut  className="w-5 h-5 text-red-600" />,          label: 'Sign Out',      action: 'button'   as const, color: 'text-red-600' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell    className="w-5 h-5" />, label: 'Notifications', action: 'toggle'   as const, value: notificationsEnabled, onChange: setNotificationsEnabled },
        { icon: <Shield  className="w-5 h-5" />, label: 'Safety Alerts', action: 'toggle'   as const, value: safetyAlertsEnabled,   onChange: setSafetyAlertsEnabled   },
        { icon: <Palette className="w-5 h-5" />, label: 'Appearance',    action: 'navigate' as const },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: <Lock   className="w-5 h-5" />, label: 'Privacy Settings',    action: 'navigate' as const },
        { icon: <Shield className="w-5 h-5" />, label: 'Safety Preferences',  action: 'navigate' as const },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: <Info className="w-5 h-5" />, label: 'Help & Support',   action: 'navigate' as const },
        { icon: <Info className="w-5 h-5" />, label: 'Terms & Privacy',  action: 'navigate' as const },
      ],
    },
  ];

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95 transition-transform">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 py-6 space-y-6">
          {sections.map((section, si) => (
            <div key={si}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                {section.title}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {section.items.map((item, ii) => (
                  <div key={ii}>
                    {item.action === 'toggle' ? (
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600">{item.icon}</div>
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        </div>
                        <button
                          onClick={() => item.onChange?.(!item.value)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.value ? 'bg-[#0099D8]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ) : (
                      <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={'color' in item ? item.color : 'text-gray-600'}>{item.icon}</div>
                          <span className={`text-sm font-medium ${'color' in item ? item.color : 'text-gray-900'}`}>
                            {item.label}
                          </span>
                        </div>
                        {item.action === 'navigate' && <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </button>
                    )}
                    {ii < section.items.length - 1 && <div className="border-b border-gray-100 ml-14" />}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center py-4">
            <p className="text-xs text-gray-400">LA Multimodal v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
