import { ArrowLeft, Shield, AlertTriangle, CheckCircle, MapPin, Clock, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function SafetyOverlay({ onBack }: Props) {
  const safetyReports = [
    {
      id: 1,
      type: 'safe',
      location: 'Metro Red Line - Hollywood/Vine',
      time: '12 min ago',
      message: 'Well-lit station, security present',
      upvotes: 24,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-500',
    },
    {
      id: 2,
      type: 'caution',
      location: 'Pico Blvd & Figueroa St',
      time: '28 min ago',
      message: 'Heavy traffic, avoid if on scooter',
      upvotes: 15,
      icon: AlertTriangle,
      color: '#F59E0B',
      bgColor: 'bg-yellow-500',
    },
    {
      id: 3,
      type: 'crowded',
      location: 'Expo Line - Expo Park',
      time: '1 hour ago',
      message: 'Very crowded due to event at venue',
      upvotes: 42,
      icon: Users,
      color: '#EF4444',
      bgColor: 'bg-red-500',
    },
  ];

  const safetyZones = [
    { name: 'Downtown LA',  level: 'high',    color: 'bg-green-500'  },
    { name: 'Hollywood',    level: 'high',    color: 'bg-green-500'  },
    { name: 'Venice Beach', level: 'medium',  color: 'bg-yellow-500' },
    { name: 'Inglewood',    level: 'medium',  color: 'bg-yellow-500' },
    { name: 'Skid Row Area',level: 'caution', color: 'bg-red-500'    },
  ];

  return (
    <div className="h-full w-full bg-white overflow-auto">
      <div className="sticky top-0 z-20 bg-[#0099D8] text-white">
        <div className="px-6 py-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" />
              <h1 className="text-xl font-bold">Safety &amp; Reports</h1>
            </div>
            <p className="text-sm text-blue-100">Real-time community updates</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Safety Heatmap</h3>
          <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }} />
            <div className="absolute top-6  left-8  w-20 h-20 bg-green-500  rounded-full opacity-50 blur-xl" />
            <div className="absolute top-12 right-12 w-24 h-24 bg-green-400  rounded-full opacity-50 blur-xl" />
            <div className="absolute bottom-8  left-16 w-16 h-16 bg-yellow-400 rounded-full opacity-50 blur-xl" />
            <div className="absolute bottom-12 right-8  w-20 h-20 bg-red-500    rounded-full opacity-40 blur-xl" />
            <div className="absolute top-10 left-12">
              <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="absolute bottom-16 right-16">
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around">
            {[['bg-green-500', 'Safe'], ['bg-yellow-500', 'Moderate'], ['bg-red-500', 'Caution']].map(([bg, label]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${bg} rounded`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area Safety Levels */}
      <div className="px-6 pb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Area Safety Levels</h3>
        <div className="space-y-2">
          {safetyZones.map((zone, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className={`w-3 h-3 rounded-full ${zone.color}`} />
              <span className="flex-1 text-sm text-gray-700">{zone.name}</span>
              <span className="text-xs text-gray-500 capitalize">{zone.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Reports */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Live Community Reports</h3>
          <span className="px-2 py-1 bg-[#91A889]/10 text-[#91A889] text-xs rounded-full font-medium">Live</span>
        </div>
        <div className="space-y-3">
          {safetyReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="rounded-2xl p-4 border-2 bg-white"
                style={{ borderColor: `${report.color}33` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.bgColor}/10`}>
                    <Icon className="w-5 h-5" style={{ color: report.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-900">{report.location}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{report.message}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {report.upvotes} helpful
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-xs font-medium text-[#0099D8]">Mark as helpful</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Button */}
      <div className="px-6 pb-8">
        <button className="w-full py-4 bg-[#E91C77] text-white rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <MessageSquare className="w-5 h-5" />
          Report an Issue
        </button>
      </div>

      {/* Safety Preferences */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Safety Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Prioritize safer routes</span>
              <div className="w-12 h-6 bg-[#0099D8] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Avoid crowded areas</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
